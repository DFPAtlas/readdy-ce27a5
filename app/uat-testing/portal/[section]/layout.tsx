const UAT_PORTAL_SECTIONS = [
  'assignments',
  'messages',
  'payments',
  'profile',
  'reports',
  'resources',
] as const;

export function generateStaticParams() {
  return UAT_PORTAL_SECTIONS.map(
    (section) => ({
      section,
    }),
  );
}

export const dynamicParams = false;

export default function UatPortalSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
