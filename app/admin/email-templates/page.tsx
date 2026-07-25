'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailTemplatesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/email/templates');
  }, [router]);
  return null;
}