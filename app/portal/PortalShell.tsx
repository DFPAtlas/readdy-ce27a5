'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  FolderOpen,
  FileText,
  Map,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';



interface PortalShellProps {
  children: React.ReactNode;
}

export default function PortalShell({ children }: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        setTimeout(() => router.replace('/portal/login'), 0);
        return;
      }
      setUserEmail(session.user.email ?? null);
      const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client';
      setUserName(name);
      setLoading(false);
      fetchUnread(session.user.id, name);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT' || !session) {
        setTimeout(() => router.replace('/portal/login'), 0);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  async function fetchUnread(uid: string, name: string) {
    const { data: projectsData } = await supabase.from('projects').select('id');
    if (!projectsData || projectsData.length === 0) return;
    const projectIds = projectsData.map(p => p.id);
    const { count } = await supabase
      .from('project_messages')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('read', false);
    if (count !== null) setUnreadCount(count);
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTimeout(() => router.replace('/portal/login'), 0);
  };

  const navItems = [
    { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
    { href: '/portal/messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { href: '/portal/files', label: 'Files', icon: FolderOpen },
    { href: '/portal/invoices', label: 'Invoices', icon: FileText },
    { href: '/portal/roadmap', label: 'Roadmap', icon: Map },
    { href: '/portal/settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:block text-xs text-slate-500 font-medium tracking-wide">
              RESHAPING YOUR DIGITAL WORLD
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-[#06B6D4]/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#06B6D4]" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[120px] truncate">
                  {userName}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-[rgba(255,255,255,0.08)]">
                      <p className="text-sm font-medium text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/portal/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/portal/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="p-4 lg:p-8">
        {children}
      </main>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#1E293B] border-r border-[rgba(255,255,255,0.08)] z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.08)]">
                <Link href="/" className="cursor-pointer" onClick={() => setSidebarOpen(false)}>
                  <span className="text-xl font-bold tracking-tight text-white">
                    Digital<span className="text-[#06B6D4]"> Footprint</span>
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="px-6 pt-4 text-xs text-slate-500 uppercase tracking-wider">Client Portal</p>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const badge = (item as any).badge as number | undefined;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#06B6D4]/10 text-[#06B6D4]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                      {badge && badge > 0 ? (
                        <span className="ml-auto w-5 h-5 bg-[#06B6D4] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[rgba(255,255,255,0.08)]">
                <p className="text-xs text-slate-500 text-center mb-4">Reshaping Your Digital World</p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}