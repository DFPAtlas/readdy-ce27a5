'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, getSessionSafe } from '@/lib/supabase';

interface AreaGateProps {
  children: React.ReactNode;
  loginPath: string;
  requiredRoles?: string[];
  publicPaths?: string[];
  profileTable?: string;
}

export default function AreaGate({ children, loginPath, requiredRoles, publicPaths, profileTable }: AreaGateProps) {
  const [checking, setChecking] = useState(true);
  const mountedRef = useRef(true);
  const pathname = usePathname();
  const router = useRouter();

  const checkingRef = useRef(checking);
  checkingRef.current = checking;

  const loginRef = useRef(loginPath);
  loginRef.current = loginPath;

  const configRef = useRef({ publicPaths, requiredRoles, profileTable });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    configRef.current = { publicPaths, requiredRoles, profileTable };
  });

  useEffect(() => {
    const { publicPaths: pub, requiredRoles: roles, profileTable: table } = configRef.current;
    const currentPathname = pathname || '';
    const login = loginRef.current;

    const isPublic = pub && pub.some((p) => currentPathname === p || currentPathname.endsWith(p));
    if (isPublic) {
      if (checkingRef.current) setChecking(false);
      return;
    }

    let cancelled = false;

    const checkSession = async () => {
      const session = await getSessionSafe();
      if (cancelled || !mountedRef.current) return;

      if (!session) {
        setTimeout(() => { if (mountedRef.current) router.replace(login); }, 0);
        return;
      }

      if (roles && table) {
        try {
          const { data: profile } = await supabase
            .from(table)
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (cancelled || !mountedRef.current) return;

          if (!profile || !profile.role || !roles.includes(profile.role)) {
            setTimeout(() => { if (mountedRef.current) router.replace(login); }, 0);
            return;
          }
        } catch {
          if (cancelled || !mountedRef.current) return;
          setTimeout(() => { if (mountedRef.current) router.replace(login); }, 0);
          return;
        }
      }

      if (mountedRef.current && checkingRef.current) setChecking(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mountedRef.current) {
        setTimeout(() => { if (mountedRef.current) router.replace(loginRef.current); }, 0);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}