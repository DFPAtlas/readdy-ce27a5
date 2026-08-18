-- Harden staff_profiles-based SECURITY DEFINER RPCs to also require an ACTIVE profile.
-- Mirrors the role allowlist hardening in 20260819000000_harden_is_staff_role_allowlist.sql.
-- A deactivated (active = false) staff account must not retain privileged RPC access.

CREATE OR REPLACE FUNCTION public.convert_lead_to_client(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_staff_role text;
  v_lead_id uuid;
  v_client_mode text;
  v_existing_client_id uuid;
  v_new_client jsonb;
  v_lead_record record;
  v_client_id uuid;
  v_now timestamptz := now();
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT role INTO v_staff_role FROM staff_profiles WHERE id = v_user_id AND active = true;
  IF v_staff_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Staff profile not found');
  END IF;

  IF v_staff_role NOT IN ('admin', 'super_admin', 'project_lead') THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not have permission to convert leads');
  END IF;

  v_lead_id := (payload->>'lead_id')::uuid;
  v_client_mode := payload->>'client_mode';
  v_existing_client_id := (payload->>'existing_client_id')::uuid;
  v_new_client := payload->'new_client';

  IF v_lead_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead ID is required');
  END IF;

  SELECT * INTO v_lead_record FROM leads WHERE id = v_lead_id FOR UPDATE;

  IF v_lead_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
  END IF;

  IF v_lead_record.status = 'converted' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_converted', true,
      'client_id', v_lead_record.converted_to_client,
      'lead_id', v_lead_id
    );
  END IF;

  IF v_client_mode = 'existing' THEN
    IF v_existing_client_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Existing client ID is required');
    END IF;

    SELECT id INTO v_client_id FROM clients WHERE id = v_existing_client_id;
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected client not found');
    END IF;

    UPDATE clients SET
      lead_id = v_lead_id,
      updated_at = v_now
    WHERE id = v_client_id;

  ELSIF v_client_mode = 'new' THEN
    IF v_new_client IS NULL OR v_new_client->>'company_name' IS NULL OR trim(v_new_client->>'company_name') = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Company name is required for new client');
    END IF;

    INSERT INTO clients (
      company_name, contact_name, email, phone, website,
      industry, status, lead_id, created_at, updated_at
    ) VALUES (
      trim(v_new_client->>'company_name'),
      trim(v_new_client->>'contact_name'),
      trim(v_new_client->>'email'),
      trim(v_new_client->>'phone'),
      trim(v_new_client->>'website'),
      v_new_client->>'industry',
      'active',
      v_lead_id,
      v_now,
      v_now
    )
    RETURNING id INTO v_client_id;

  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid client_mode. Must be existing or new');
  END IF;

  UPDATE leads SET
    status = 'converted',
    stage = 'converted',
    converted_to_client = v_client_id,
    converted_by = v_user_id,
    converted_at = v_now,
    updated_at = v_now,
    last_activity_at = v_now,
    stage_changed_at = v_now
  WHERE id = v_lead_id;

  INSERT INTO lead_stage_history (
    lead_id, from_stage, to_stage, changed_by, reason, created_at
  ) VALUES (
    v_lead_id,
    v_lead_record.stage,
    'converted',
    v_user_id,
    'Lead converted to client',
    v_now
  );

  RETURN jsonb_build_object(
    'success', true,
    'already_converted', false,
    'client_id', v_client_id,
    'lead_id', v_lead_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_project_with_discovery(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_profile_role text;
  v_client_id uuid;
  v_project_id uuid;
  v_now timestamptz;
  v_client_mode text;
  v_new_client jsonb;
  v_project jsonb;
  v_discovery jsonb;
  v_requirements jsonb;
  v_roadmap jsonb;
  v_step_data jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT sp.id, sp.role INTO v_profile_id, v_profile_role
  FROM public.staff_profiles sp
  WHERE sp.id = v_user_id AND sp.active = true;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a valid staff profile');
  END IF;

  IF v_profile_role NOT IN ('admin', 'super_admin', 'project_lead') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions to create projects');
  END IF;

  v_now := now();
  v_client_mode := payload->>'client_mode';
  v_new_client := payload->'new_client';
  v_project := payload->'project';
  v_discovery := payload->'discovery';
  v_requirements := payload->'requirements';
  v_roadmap := payload->'roadmap';

  IF v_client_mode = 'existing' THEN
    v_client_id := (payload->>'client_id')::uuid;
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Existing client ID is required');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = v_client_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected client does not exist');
    END IF;
  ELSIF v_client_mode = 'new' THEN
    IF v_new_client IS NULL OR (v_new_client->>'company_name') IS NULL OR trim(v_new_client->>'company_name') = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Company name is required for new client');
    END IF;

    INSERT INTO public.clients (
      company_name, contact_name, email, phone, address, website, industry, status, created_at, updated_at
    ) VALUES (
      trim(v_new_client->>'company_name'),
      NULLIF(trim(v_new_client->>'contact_name'), ''),
      NULLIF(trim(v_new_client->>'email'), ''),
      NULLIF(trim(v_new_client->>'phone'), ''),
      NULLIF(trim(v_new_client->>'address'), ''),
      NULLIF(trim(v_new_client->>'website'), ''),
      NULLIF(trim(v_new_client->>'industry'), ''),
      'active',
      v_now,
      v_now
    )
    RETURNING id INTO v_client_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid client_mode');
  END IF;

  IF v_project IS NULL OR (v_project->>'name') IS NULL OR trim(v_project->>'name') = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Project name is required');
  END IF;

  v_step_data := jsonb_build_object(
    'client_details', jsonb_build_object(
      'client_mode', v_client_mode,
      'client_id', v_client_id
    ),
    'business_overview', v_discovery->'business_overview',
    'services', v_discovery->'services',
    'goals', v_discovery->'goals',
    'scope', v_discovery->'scope',
    'technical', v_discovery->'technical',
    'budget', v_discovery->'budget',
    'roadmap_summary', v_discovery->'roadmap_summary'
  );

  INSERT INTO public.projects (
    client_id, name, description, objective, status, budget,
    start_date, end_date, progress, project_lead, priority,
    health, created_at, updated_at
  ) VALUES (
    v_client_id,
    trim(v_project->>'name'),
    NULLIF(trim(v_project->>'description'), ''),
    NULLIF(trim(v_project->>'objective'), ''),
    'planning',
    COALESCE((v_project->>'budget')::numeric, 0),
    NULLIF(trim(v_project->>'start_date'), '')::date,
    NULLIF(trim(v_project->>'end_date'), '')::date,
    0,
    NULLIF(trim(v_project->>'project_lead'), '')::uuid,
    COALESCE(NULLIF(trim(v_project->>'priority'), ''), 'medium'),
    'not_enough_data',
    v_now,
    v_now
  )
  RETURNING id INTO v_project_id;

  INSERT INTO public.project_access (
    project_id, user_id, client_id, access_level, created_at, updated_at
  ) VALUES (
    v_project_id,
    v_profile_id,
    v_client_id,
    'full',
    v_now,
    v_now
  );

  INSERT INTO public.project_discovery (
    project_id, client_id, step_data, completed_steps, completed, created_at, updated_at
  ) VALUES (
    v_project_id,
    v_client_id,
    v_step_data,
    9,
    true,
    v_now,
    v_now
  );

  IF v_requirements IS NOT NULL THEN
    INSERT INTO public.project_requirements (
      project_id,
      required_pages,
      required_features,
      integrations,
      user_roles,
      admin_dashboard,
      client_portal,
      payment_required,
      email_required,
      file_upload_required,
      created_at,
      updated_at
    ) VALUES (
      v_project_id,
      COALESCE((SELECT array_agg(trim(j.value)) FROM jsonb_array_elements_text(v_requirements->'required_pages') j WHERE trim(j.value) <> ''), ARRAY[]::text[]),
      COALESCE((SELECT array_agg(trim(j.value)) FROM jsonb_array_elements_text(v_requirements->'required_features') j WHERE trim(j.value) <> ''), ARRAY[]::text[]),
      COALESCE((SELECT array_agg(trim(j.value)) FROM jsonb_array_elements_text(v_requirements->'integrations') j WHERE trim(j.value) <> ''), ARRAY[]::text[]),
      COALESCE((SELECT array_agg(trim(j.value)) FROM jsonb_array_elements_text(v_requirements->'user_roles') j WHERE trim(j.value) <> ''), ARRAY[]::text[]),
      COALESCE((v_requirements->>'admin_dashboard')::boolean, false),
      COALESCE((v_requirements->>'client_portal')::boolean, true),
      COALESCE((v_requirements->>'payment_required')::boolean, false),
      COALESCE((v_requirements->>'email_required')::boolean, false),
      COALESCE((v_requirements->>'file_upload_required')::boolean, false),
      v_now,
      v_now
    );
  END IF;

  INSERT INTO public.project_activity (
    project_id, actor_id, activity_type, title, description, metadata, created_at, updated_at
  ) VALUES (
    v_project_id,
    v_profile_id,
    'project_created',
    'Project created',
    'Project created from Discovery Wizard',
    jsonb_build_object('creator_id', v_profile_id, 'client_id', v_client_id),
    v_now,
    v_now
  );

  IF v_roadmap IS NOT NULL AND jsonb_typeof(v_roadmap) = 'array' AND jsonb_array_length(v_roadmap) > 0 THEN
    INSERT INTO public.technology_roadmap (
      project_id, client_id, title, description, category, priority, status, target_date, created_at, updated_at
    )
    SELECT
      v_project_id,
      v_client_id,
      trim(r->>'title'),
      NULLIF(trim(r->>'description'), ''),
      NULLIF(trim(r->>'category'), ''),
      COALESCE(NULLIF(trim(r->>'priority'), ''), 'medium'),
      COALESCE(NULLIF(trim(r->>'status'), ''), 'proposed'),
      NULLIF(trim(r->>'target_date'), '')::date,
      v_now,
      v_now
    FROM jsonb_array_elements(v_roadmap) AS r
    WHERE trim(r->>'title') IS NOT NULL AND trim(r->>'title') <> '';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'project_id', v_project_id,
    'client_id', v_client_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;