-- Create the missing public.bs_has_staff_role(user_id, role) helper.
-- Five SECURITY DEFINER admin functions (bs_grant_staff_role, bs_revoke_staff_role,
-- bs_suspend_staff_access, bs_admin_update_feature_flag, bs_admin_update_setting)
-- call public.bs_has_staff_role(v_actor_id, 'platform_admin'), but only the
-- bs_private.bs_has_staff_role(required_roles text[]) variant existed. This made
-- those admin actions fail at runtime with "function does not exist".

-- Self-check only: the helper verifies the caller's own active role so it cannot
-- be used to probe other users' role assignments. All five call sites pass
-- auth.uid() as the target user id, so this matches their intent exactly.

CREATE OR REPLACE FUNCTION public.bs_has_staff_role(p_user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bs_staff_roles r
    WHERE r.user_id = p_user_id
      AND p_user_id = (SELECT auth.uid())
      AND r.status = 'active'
      AND r.role = required_role
  );
$$;

REVOKE ALL ON FUNCTION public.bs_has_staff_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bs_has_staff_role(uuid, text) TO authenticated;