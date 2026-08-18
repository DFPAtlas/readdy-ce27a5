-- Harden uat_quarantine_message to require an active, full-admin profile
-- (matches is_admin(): active = true AND role IN ('owner','super_admin','admin'))

create or replace function public.uat_quarantine_message(p_message_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
begin
  if not exists (
    select 1 from public.admin_profiles
    where id = auth.uid()
      and active = true
      and role in ('owner', 'super_admin', 'admin')
  ) then
    return jsonb_build_object('success', false, 'error', 'Staff only');
  end if;

  update public.uat_sandbox_messages set status = 'quarantined', updated_at = now() where id = p_message_id;

  insert into public.uat_sandbox_message_events (message_id, event_type, safe_metadata)
  values (p_message_id, 'quarantined', jsonb_build_object('reason', p_reason));

  return jsonb_build_object('success', true);
end;
$$;