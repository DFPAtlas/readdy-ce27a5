-- Pin search_path on 17 SECURITY DEFINER functions (mostly UAT sandbox + handle_new_user)
-- Every unqualified table reference is schema-qualified to public.* so the functions
-- continue to resolve correctly under an empty search_path.

CREATE OR REPLACE FUNCTION public.end_uat_sandbox(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_status text;
  v_cleanup boolean;
BEGIN
  SELECT t.id INTO v_tester_id FROM public.uat_testers t WHERE t.user_id = auth.uid();
  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found');
  END IF;

  SELECT si.status, COALESCE(ss.cleanup_after_session, true)
  INTO v_status, v_cleanup
  FROM public.uat_sandbox_instances si
  LEFT JOIN public.uat_sandbox_settings ss ON ss.project_id = si.project_id AND (ss.environment_id = si.environment_id OR si.environment_id IS NULL)
  WHERE si.id = p_instance_id AND si.tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox not found or access denied');
  END IF;

  IF v_status IN ('ended','expired','failed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox is already in a terminal state');
  END IF;

  UPDATE public.uat_sandbox_instances
  SET status = 'ending', updated_at = now()
  WHERE id = p_instance_id;

  UPDATE public.uat_sandbox_accounts
  SET status = 'disabled', disabled_at = now()
  WHERE sandbox_instance_id = p_instance_id AND status != 'disabled';

  IF v_cleanup THEN
    UPDATE public.uat_sandbox_seeded_records
    SET status = 'removed', deleted_at = now()
    WHERE sandbox_instance_id = p_instance_id;
  END IF;

  UPDATE public.uat_sandbox_instances
  SET status = 'ended', ended_at = now(), launch_reference = NULL, updated_at = now()
  WHERE id = p_instance_id;

  INSERT INTO public.uat_sandbox_actions (sandbox_instance_id, assignment_id, tester_id, action_type, status, requested_by_user_id)
  SELECT id, assignment_id, tester_id, 'end', 'completed', auth.uid()
  FROM public.uat_sandbox_instances WHERE id = p_instance_id;

  INSERT INTO public.uat_audit_log (action, entity_type, entity_id, new_value)
  VALUES ('sandbox_ended', 'uat_sandbox_instance', p_instance_id,
    jsonb_build_object('cleanup', v_cleanup));

  RETURN jsonb_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.extend_uat_sandbox(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_status text;
  v_expires timestamptz;
  v_max_min integer;
  v_new_expires timestamptz;
BEGIN
  SELECT t.id INTO v_tester_id FROM public.uat_testers t WHERE t.user_id = auth.uid();
  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found');
  END IF;

  SELECT si.status, si.expires_at, COALESCE(ss.maximum_extension_minutes, 60)
  INTO v_status, v_expires, v_max_min
  FROM public.uat_sandbox_instances si
  LEFT JOIN public.uat_sandbox_settings ss ON ss.project_id = si.project_id AND (ss.environment_id = si.environment_id OR si.environment_id IS NULL)
  WHERE si.id = p_instance_id AND si.tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox not found or access denied');
  END IF;

  IF v_status NOT IN ('active','paused','ready') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox is not in an extendable state');
  END IF;

  v_new_expires := v_expires + (v_max_min || ' minutes')::interval;

  UPDATE public.uat_sandbox_instances
  SET expires_at = v_new_expires, updated_at = now()
  WHERE id = p_instance_id;

  INSERT INTO public.uat_sandbox_actions (sandbox_instance_id, assignment_id, tester_id, action_type, status, requested_by_user_id)
  SELECT id, assignment_id, tester_id, 'extend', 'completed', auth.uid()
  FROM public.uat_sandbox_instances WHERE id = p_instance_id;

  INSERT INTO public.uat_audit_log (action, entity_type, entity_id, new_value)
  VALUES ('sandbox_extended', 'uat_sandbox_instance', p_instance_id,
    jsonb_build_object('new_expires_at', v_new_expires));

  RETURN jsonb_build_object('success', true, 'new_expires_at', v_new_expires);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_uat_sandbox_access(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_instance RECORD;
  v_accounts jsonb;
  v_settings RECORD;
BEGIN
  SELECT t.id INTO v_tester_id
  FROM public.uat_testers t WHERE t.user_id = auth.uid() AND t.status IN ('approved', 'active');

  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found or not approved');
  END IF;

  SELECT si.* INTO v_instance
  FROM public.uat_sandbox_instances si
  WHERE si.id = p_instance_id AND si.tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox not found or access denied');
  END IF;

  IF v_instance.status NOT IN ('ready','active','paused') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox is not accessible. Current status: ' || v_instance.status);
  END IF;

  IF v_instance.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox has expired');
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', sa.id,
      'account_type', sa.account_type,
      'display_name', sa.display_name,
      'username', sa.username,
      'email', sa.email,
      'status', sa.status,
      'credential_reference', sa.credential_reference
    )
  ), '[]'::jsonb) INTO v_accounts
  FROM public.uat_sandbox_accounts sa
  WHERE sa.sandbox_instance_id = p_instance_id AND sa.status != 'disabled';

  SELECT * INTO v_settings
  FROM public.uat_sandbox_settings
  WHERE project_id = v_instance.project_id
    AND (environment_id = v_instance.environment_id OR v_instance.environment_id IS NULL);

  INSERT INTO public.uat_audit_log (action, entity_type, entity_id, new_value)
  VALUES ('sandbox_launched', 'uat_sandbox_instance', p_instance_id, jsonb_build_object('accessed_at', now()));

  RETURN jsonb_build_object(
    'success', true,
    'instance_id', v_instance.id,
    'sandbox_url', v_instance.sandbox_url,
    'mode', v_instance.sandbox_mode,
    'status', v_instance.status,
    'expires_at', v_instance.expires_at,
    'accounts', v_accounts,
    'settings', jsonb_build_object(
      'downloads_allowed', COALESCE(v_settings.downloads_allowed, true),
      'uploads_allowed', COALESCE(v_settings.uploads_allowed, true),
      'payment_test_mode_required', COALESCE(v_settings.payment_test_mode_required, true)
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    auth_user_id,
    email,
    full_name,
    company_name,
    role,
    display_name,
    status,
    timezone
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organisation_name', ''),
    'client',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'active',
    'Europe/London'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.pause_uat_sandbox(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_status text;
BEGIN
  SELECT t.id INTO v_tester_id FROM public.uat_testers t WHERE t.user_id = auth.uid();
  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found');
  END IF;

  SELECT status INTO v_status FROM public.uat_sandbox_instances
  WHERE id = p_instance_id AND tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox not found or access denied');
  END IF;

  IF v_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox must be active to pause. Current: ' || v_status);
  END IF;

  UPDATE public.uat_sandbox_instances
  SET status = 'paused', paused_at = now(), updated_at = now()
  WHERE id = p_instance_id;

  INSERT INTO public.uat_sandbox_actions (sandbox_instance_id, assignment_id, tester_id, action_type, status, requested_by_user_id)
  SELECT id, assignment_id, tester_id, 'pause', 'completed', auth.uid()
  FROM public.uat_sandbox_instances WHERE id = p_instance_id;

  RETURN jsonb_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.request_uat_sandbox(p_assignment_id uuid, p_session_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_project_id uuid;
  v_environment_id uuid;
  v_job_id uuid;
  v_settings RECORD;
  v_existing_id uuid;
  v_instance_id uuid;
  v_expires_at timestamptz;
BEGIN
  SELECT t.id INTO v_tester_id
  FROM public.uat_testers t
  WHERE t.user_id = auth.uid() AND t.status IN ('approved', 'active');

  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found or not approved');
  END IF;

  SELECT a.job_id INTO v_job_id
  FROM public.uat_assignments a
  WHERE a.id = p_assignment_id AND a.tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Assignment not found or access denied');
  END IF;

  IF v_job_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Assignment has no linked job');
  END IF;

  SELECT j.project_id, j.environment_id
  INTO v_project_id, v_environment_id
  FROM public.uat_jobs j WHERE j.id = v_job_id;

  IF v_project_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Project not found for assignment');
  END IF;

  SELECT * INTO v_settings
  FROM public.uat_sandbox_settings
  WHERE project_id = v_project_id
    AND (environment_id = v_environment_id OR v_environment_id IS NULL);

  IF NOT FOUND OR NOT v_settings.sandbox_enabled THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox is not enabled for this project');
  END IF;

  SELECT id INTO v_existing_id
  FROM public.uat_sandbox_instances
  WHERE assignment_id = p_assignment_id
    AND tester_id = v_tester_id
    AND status NOT IN ('ended','expired','failed');

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'instance_id', v_existing_id, 'already_exists', true);
  END IF;

  IF p_session_id IS NOT NULL THEN
    PERFORM 1 FROM public.uat_sessions
    WHERE id = p_session_id
      AND assignment_id = p_assignment_id
      AND tester_id = v_tester_id
      AND status IN ('active','paused');
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Session not active or access denied');
    END IF;
  END IF;

  v_expires_at := now() + (v_settings.session_duration_minutes || ' minutes')::interval;

  INSERT INTO public.uat_sandbox_instances (project_id, environment_id, job_id, assignment_id, session_id, tester_id, sandbox_mode, status, expires_at)
  VALUES (v_project_id, v_environment_id, v_job_id, p_assignment_id, p_session_id, v_tester_id, v_settings.sandbox_mode, 'requested', v_expires_at)
  RETURNING id INTO v_instance_id;

  INSERT INTO public.uat_sandbox_actions (sandbox_instance_id, assignment_id, tester_id, action_type, status, requested_by_user_id)
  VALUES (v_instance_id, p_assignment_id, v_tester_id, 'provision', 'requested', auth.uid());

  INSERT INTO public.uat_audit_log (action, entity_type, entity_id, new_value)
  VALUES ('sandbox_requested', 'uat_sandbox_instance', v_instance_id, jsonb_build_object('project_id', v_project_id, 'mode', v_settings.sandbox_mode));

  RETURN jsonb_build_object('success', true, 'instance_id', v_instance_id, 'mode', v_settings.sandbox_mode, 'expires_at', v_expires_at);
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_uat_sandbox_data(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_status text;
  v_reset_enabled boolean;
BEGIN
  SELECT t.id INTO v_tester_id FROM public.uat_testers t
  WHERE t.user_id = auth.uid() AND t.status IN ('approved', 'active');
  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found or not approved');
  END IF;

  SELECT si.status, COALESCE(ss.reset_enabled, true)
  INTO v_status, v_reset_enabled
  FROM public.uat_sandbox_instances si
  LEFT JOIN public.uat_sandbox_settings ss ON ss.project_id = si.project_id AND (ss.environment_id = si.environment_id OR si.environment_id IS NULL)
  WHERE si.id = p_instance_id AND si.tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox not found or access denied');
  END IF;

  IF NOT v_reset_enabled THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reset is not enabled for this sandbox');
  END IF;

  IF v_status NOT IN ('active','paused') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox must be active or paused to reset. Current: ' || v_status);
  END IF;

  UPDATE public.uat_sandbox_instances
  SET status = 'resetting', updated_at = now(), reset_count = reset_count + 1
  WHERE id = p_instance_id;

  UPDATE public.uat_sandbox_seeded_records
  SET status = 'removed', deleted_at = now()
  WHERE sandbox_instance_id = p_instance_id;

  INSERT INTO public.uat_sandbox_actions (sandbox_instance_id, assignment_id, tester_id, action_type, status, requested_by_user_id)
  SELECT id, assignment_id, tester_id, 'reset_data', 'completed', auth.uid()
  FROM public.uat_sandbox_instances WHERE id = p_instance_id;

  UPDATE public.uat_sandbox_instances
  SET status = 'ready', updated_at = now()
  WHERE id = p_instance_id;

  RETURN jsonb_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.resume_uat_sandbox(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_tester_id uuid;
  v_status text;
BEGIN
  SELECT t.id INTO v_tester_id FROM public.uat_testers t WHERE t.user_id = auth.uid();
  IF v_tester_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tester not found');
  END IF;

  SELECT status INTO v_status FROM public.uat_sandbox_instances
  WHERE id = p_instance_id AND tester_id = v_tester_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox not found or access denied');
  END IF;

  IF v_status != 'paused' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sandbox must be paused to resume. Current: ' || v_status);
  END IF;

  UPDATE public.uat_sandbox_instances
  SET status = 'active', paused_at = NULL, updated_at = now()
  WHERE id = p_instance_id;

  INSERT INTO public.uat_sandbox_actions (sandbox_instance_id, assignment_id, tester_id, action_type, status, requested_by_user_id)
  SELECT id, assignment_id, tester_id, 'resume', 'completed', auth.uid()
  FROM public.uat_sandbox_instances WHERE id = p_instance_id;

  RETURN jsonb_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.uat_expire_old_messages()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_count integer := 0;
begin
  update public.uat_sandbox_messages
  set status = 'expired', updated_at = now()
  where status != 'expired'
    and expires_at is not null
    and expires_at < now()
    and id not in (
      select message_id from public.uat_feedback_messages
      union
      select message_id from public.uat_test_case_messages
    );

  get diagnostics v_count = row_count;

  return v_count;
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_intercept_email(p_sandbox_instance_id uuid, p_sender text, p_recipient text, p_subject text, p_content_text text, p_content_html_reference text DEFAULT NULL::text, p_template_reference text DEFAULT NULL::text, p_provider_name text DEFAULT NULL::text, p_provider_ref text DEFAULT NULL::text, p_message_size integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_instance record;
  v_settings record;
  v_message_id uuid;
  v_status text := 'intercepted';
  v_simulation text;
  v_safe_recipient text;
begin
  if current_user not in ('service_role', 'postgres') then
    return jsonb_build_object('success', false, 'error', 'Access denied');
  end if;

  select * into v_instance from public.uat_sandbox_instances
  where id = p_sandbox_instance_id and status not in ('ended', 'expired', 'failed') limit 1;

  if v_instance is null then
    return jsonb_build_object('success', false, 'error', 'Sandbox not found or unavailable');
  end if;

  select * into v_settings from public.uat_sandbox_communication_settings
  where project_id = v_instance.project_id
    and (environment_id is null or environment_id = v_instance.environment_id)
    and email_interception_enabled = true
  order by environment_id nulls last limit 1;

  if v_settings is null then
    return jsonb_build_object('success', false, 'error', 'Email interception not configured');
  end if;

  if v_settings.block_unapproved_recipients then
    if p_recipient !~ '@(dfp-test\.local|example\.test|digital-footprint\.uk|dfp\.test)$' then
      v_status := 'blocked';
    end if;
  end if;

  v_simulation := v_settings.delivery_simulation_mode;
  if v_simulation = 'simulate_delivered' then v_status := 'simulated_delivered'; end if;
  if v_simulation = 'simulate_failed' then v_status := 'simulated_failed'; end if;

  v_safe_recipient := regexp_replace(p_recipient, '^([^@]{2})[^@]*(@.*)$', '\1***\2');

  insert into public.uat_sandbox_messages (project_id, environment_id, assignment_id, session_id, sandbox_instance_id, tester_id, message_type, direction, provider_name, provider_message_reference, sender_address, recipient_address, recipient_display, subject, safe_preview, content_text, content_html_reference, template_reference, status, delivery_simulation, intercepted_at, expires_at)
  values (v_instance.project_id, v_instance.environment_id, v_instance.assignment_id, v_instance.session_id, p_sandbox_instance_id, v_instance.tester_id, 'email', 'outbound', p_provider_name, p_provider_ref, p_sender, v_safe_recipient, p_recipient, p_subject, left(p_content_text, 200), p_content_text, p_content_html_reference, p_template_reference, v_status, v_simulation, now(), now() + (v_settings.retention_days || ' days')::interval)
  returning id into v_message_id;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (v_message_id, 'captured', jsonb_build_object('size', p_message_size));

  if v_status = 'blocked' then
    insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
    values (v_message_id, 'blocked', jsonb_build_object('reason', 'unapproved_recipient'));
  end if;

  if v_status in ('simulated_delivered', 'simulated_failed') then
    insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
    values (v_message_id, v_status, '');
  end if;

  return jsonb_build_object('success', true, 'intercepted', true, 'message_id', v_message_id, 'status', v_status);
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_intercept_sms(p_sandbox_instance_id uuid, p_sender text, p_recipient text, p_content_text text, p_provider_name text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_instance record;
  v_settings record;
  v_message_id uuid;
  v_status text := 'intercepted';
  v_simulation text;
begin
  if current_user not in ('service_role', 'postgres') then
    return jsonb_build_object('success', false, 'error', 'Access denied');
  end if;

  select * into v_instance from public.uat_sandbox_instances
  where id = p_sandbox_instance_id and status not in ('ended', 'expired', 'failed') limit 1;

  if v_instance is null then
    return jsonb_build_object('success', false, 'error', 'Sandbox unavailable');
  end if;

  select * into v_settings from public.uat_sandbox_communication_settings
  where project_id = v_instance.project_id and sms_interception_enabled = true limit 1;

  if v_settings is null then
    return jsonb_build_object('success', false, 'error', 'SMS interception not configured');
  end if;

  v_simulation := v_settings.delivery_simulation_mode;
  if v_simulation = 'simulate_delivered' then v_status := 'simulated_delivered'; end if;
  if v_simulation = 'simulate_failed' then v_status := 'simulated_failed'; end if;

  insert into public.uat_sandbox_messages (project_id, environment_id, assignment_id, session_id, sandbox_instance_id, tester_id, message_type, direction, provider_name, sender_address, recipient_address, subject, safe_preview, content_text, status, delivery_simulation, intercepted_at, expires_at)
  values (v_instance.project_id, v_instance.environment_id, v_instance.assignment_id, v_instance.session_id, p_sandbox_instance_id, v_instance.tester_id, 'sms', 'outbound', p_provider_name, p_sender, left(p_recipient, 4) || '****', 'SMS', left(p_content_text, 200), p_content_text, v_status, v_simulation, now(), now() + (v_settings.retention_days || ' days')::interval)
  returning id into v_message_id;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (v_message_id, 'captured', jsonb_build_object('type', 'sms'));

  return jsonb_build_object('success', true, 'intercepted', true, 'message_id', v_message_id, 'status', v_status);
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_intercept_webhook(p_sandbox_instance_id uuid, p_event_name text, p_http_method text, p_destination text, p_safe_summary jsonb DEFAULT NULL::jsonb, p_provider_name text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_instance record;
  v_settings record;
  v_message_id uuid;
  v_status text := 'intercepted';
  v_simulation text;
begin
  if current_user not in ('service_role', 'postgres') then
    return jsonb_build_object('success', false, 'error', 'Access denied');
  end if;

  select * into v_instance from public.uat_sandbox_instances
  where id = p_sandbox_instance_id and status not in ('ended', 'expired', 'failed') limit 1;

  if v_instance is null then
    return jsonb_build_object('success', false, 'error', 'Sandbox unavailable');
  end if;

  select * into v_settings from public.uat_sandbox_communication_settings
  where project_id = v_instance.project_id and webhook_interception_enabled = true limit 1;

  if v_settings is null then
    return jsonb_build_object('success', false, 'error', 'Webhook interception not configured');
  end if;

  v_simulation := v_settings.delivery_simulation_mode;
  if v_simulation = 'simulate_delivered' then v_status := 'simulated_delivered'; end if;
  if v_simulation = 'simulate_failed' then v_status := 'simulated_failed'; end if;

  insert into public.uat_sandbox_messages (project_id, environment_id, assignment_id, session_id, sandbox_instance_id, tester_id, message_type, direction, provider_name, recipient_address, subject, safe_preview, content_text, status, delivery_simulation, intercepted_at, expires_at)
  values (v_instance.project_id, v_instance.environment_id, v_instance.assignment_id, v_instance.session_id, p_sandbox_instance_id, v_instance.tester_id, 'webhook', 'outbound', p_provider_name, p_destination, p_event_name, p_safe_summary::text, p_safe_summary::text, v_status, v_simulation, now(), now() + (v_settings.retention_days || ' days')::interval)
  returning id into v_message_id;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (v_message_id, 'captured', jsonb_build_object('method', p_http_method, 'destination', p_destination));

  return jsonb_build_object('success', true, 'intercepted', true, 'message_id', v_message_id, 'status', v_status);
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_link_message_to_case(p_message_id uuid, p_assignment_test_case_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_tester_id uuid;
  v_assignment_id uuid;
begin
  select id into v_tester_id from public.uat_testers where user_id = auth.uid();
  if v_tester_id is null then
    return jsonb_build_object('success', false, 'error', 'Not an approved tester');
  end if;

  select assignment_id into v_assignment_id from public.uat_assignment_test_cases where id = p_assignment_test_case_id;
  if not exists (select 1 from public.uat_sandbox_messages where id = p_message_id and tester_id = v_tester_id) then
    return jsonb_build_object('success', false, 'error', 'Message not found or not owned');
  end if;

  if not exists (select 1 from public.uat_assignments where id = v_assignment_id and tester_id = v_tester_id) then
    return jsonb_build_object('success', false, 'error', 'Test case not in your assignment');
  end if;

  insert into public.uat_test_case_messages (assignment_test_case_id, message_id)
  values (p_assignment_test_case_id, p_message_id)
  on conflict (assignment_test_case_id, message_id) do nothing;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (p_message_id, 'linked_to_test_case', jsonb_build_object('case_id', p_assignment_test_case_id));

  return jsonb_build_object('success', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_link_message_to_feedback(p_message_id uuid, p_feedback_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_tester_id uuid;
begin
  select id into v_tester_id from public.uat_testers where user_id = auth.uid();
  if v_tester_id is null then
    return jsonb_build_object('success', false, 'error', 'Not an approved tester');
  end if;

  if not exists (select 1 from public.uat_sandbox_messages where id = p_message_id and tester_id = v_tester_id) then
    return jsonb_build_object('success', false, 'error', 'Message not found or not owned');
  end if;

  if not exists (select 1 from public.uat_feedback where id = p_feedback_id and tester_id = v_tester_id) then
    return jsonb_build_object('success', false, 'error', 'Feedback not found or not owned');
  end if;

  insert into public.uat_feedback_messages (feedback_id, message_id)
  values (p_feedback_id, p_message_id)
  on conflict (feedback_id, message_id) do nothing;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (p_message_id, 'linked_to_feedback', jsonb_build_object('feedback_id', p_feedback_id));

  return jsonb_build_object('success', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_mark_message_reviewed(p_message_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_tester_id uuid;
begin
  select id into v_tester_id from public.uat_testers where user_id = auth.uid();
  if not exists (select 1 from public.uat_sandbox_messages where id = p_message_id and tester_id = v_tester_id) then
    return jsonb_build_object('success', false, 'error', 'Not your message');
  end if;

  update public.uat_sandbox_messages set status = 'reviewed', updated_at = now() where id = p_message_id;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (p_message_id, 'opened_in_test_mailbox', '');

  return jsonb_build_object('success', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.uat_tester_comm_project_ids(tester_uuid uuid)
 RETURNS SETOF uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  select distinct j.project_id
  from public.uat_assignments a
  join public.uat_jobs j on j.id = a.job_id
  where a.tester_id = tester_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.uat_tester_mailbox_stats(p_assignment_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_tester_id uuid;
begin
  select id into v_tester_id from public.uat_testers where user_id = auth.uid();

  return (
    select jsonb_build_object(
      'email', count(*) filter (where message_type = 'email'),
      'sms', count(*) filter (where message_type = 'sms'),
      'webhook', count(*) filter (where message_type = 'webhook'),
      'blocked', count(*) filter (where status = 'blocked'),
      'total', count(*),
      'latest', max(intercepted_at)
    )
    from public.uat_sandbox_messages
    where assignment_id = p_assignment_id
      and tester_id = v_tester_id
  );
end;
$function$;