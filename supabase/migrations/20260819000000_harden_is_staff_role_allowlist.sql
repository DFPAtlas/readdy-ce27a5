-- Harden app_private.is_staff() to enforce the same role allowlist as the
-- frontend staff AreaGate (app/staff/layout.tsx): staff, admin, super_admin.
--
-- Previously is_staff() only checked active=true, so ANY active staff_profiles
-- row (contractor, auditor, manager, team_lead, department_head) inherited
-- internal write access through is_internal(). This closes that gap so the
-- database layer and the frontend gate agree.
--
-- Role strings are matched case-insensitively against both the stored key and
-- the display label, mirroring normaliseAdminRole() in lib/admin-roles.ts.

CREATE OR REPLACE FUNCTION app_private.is_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.staff_profiles s
    where s.id = (select auth.uid())
      and s.active = true
      and lower(s.role) in (
        'staff', 'staff member',
        'admin', 'administrator',
        'super_admin', 'super administrator'
      )
  );
$function$;