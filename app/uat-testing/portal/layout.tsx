import UATPortalShell from '@/components/uat/UATPortalShell';

export default function UATPortalLayout({ children }: { children: React.ReactNode }) {
  return <UATPortalShell>{children}</UATPortalShell>;
}
