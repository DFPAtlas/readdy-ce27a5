import AreaGate from '@/components/AreaGate';

export default function UATLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate loginPath="/uat-testing">
      {children}
    </AreaGate>
  );
}