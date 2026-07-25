import AreaGate from '@/components/AreaGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate
      loginPath="/admin/login"
      requiredRoles={['admin', 'super_admin']}
      profileTable="admin_profiles"
      publicPaths={['/admin/login', '/admin/reset-password', '/admin/recovery']}
    >
      {children}
    </AreaGate>
  );
}