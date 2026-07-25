'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCircle,
  CheckSquare,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Plus,
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { href: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/staff/leads', icon: UserCircle, label: 'Leads' },
  { href: '/staff/clients', icon: Users, label: 'Clients' },
  { href: '/staff/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/staff/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/staff/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/staff/files', icon: FolderOpen, label: 'Files' },
  { href: '/staff/settings', icon: Settings, label: 'Settings' },
];

export default function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Staff');
        supabase.from('staff_profiles').select('role').eq('id', session.user.id).maybeSingle().then(({ data }) => {
          if (cancelled) return;
          if (data?.role) setUserRole(data.role);
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/staff/login');
  };

  const roleLabel = userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : userRole === 'project_lead' ? 'Project Lead' : userRole === 'developer' ? 'Developer' : userRole === 'support' ? 'Support' : 'Staff';

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex">
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 bg-[#1E293B] border-r border-[rgba(255,255,255,0.08)]">
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)]">
          <Link href="/staff/dashboard" className="flex items-center gap-3 cursor-pointer">
            <Image
              src="https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/eee9f9ba-b907-488b-a1a8-f6d02534a71b_compressed_Remove-Background-Keep-Foot-Logo.webp"
              alt="Logo"
              width={34}
              height={34}
              className="object-contain rounded-lg"
            />
            <div>
              <div className="font-bold text-sm text-white">Digital-Footprint</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Staff Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/staff/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#06B6D4]/10 text-[#06B6D4]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
          <p className="text-[10px] text-slate-500 text-center px-2">One Contact. One Relationship. One Vision.</p>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#1E293B] border-r border-[rgba(255,255,255,0.08)] z-50 flex flex-col lg:hidden shadow-xl"
            >
              <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                <Link href="/staff/dashboard" className="flex items-center gap-3 cursor-pointer" onClick={() => setSidebarOpen(false)}>
                  <Image src="https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/eee9f9ba-b907-488b-a1a8-f6d02534a71b_compressed_Remove-Background-Keep-Foot-Logo.webp" alt="Logo" width={34} height={34} className="object-contain rounded-lg" />
                  <span className="font-bold text-sm text-white">Digital-Footprint</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/staff/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? 'bg-[#06B6D4]/10 text-[#06B6D4]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <item.icon className="w-[18px] h-[18px]" /><span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64 min-h-screen">
        <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-[#0F172A]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] shadow-sm' : 'bg-transparent'}`}>
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white cursor-pointer">
                <Menu className="w-5 h-5" />
              </button>
              <span className="hidden sm:block text-xs text-slate-500 font-medium tracking-wide">ONE CONTACT. ONE RELATIONSHIP. ONE VISION.</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4]/30 transition-all cursor-pointer relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 bg-[#1E293B] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                        <span className="font-semibold text-sm text-white">Notifications</span>
                        <span className="text-xs text-[#06B6D4] cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {[
                          { title: 'New lead from contact form', desc: 'TechNova Solutions — Website Design', time: '5 min ago', color: '#06B6D4' },
                          { title: 'Milestone completed', desc: 'Phase 1 — GreenEnergy Platform', time: '2 hours ago', color: '#10B981' },
                          { title: 'Task overdue', desc: 'API integration for FinServe project', time: '1 day ago', color: '#F59E0B' },
                        ].map((n, i) => (
                          <div key={i} className="p-4 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-[rgba(255,255,255,0.05)] last:border-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: n.color + '20' }}>
                              <Bell className="w-3.5 h-3.5" style={{ color: n.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{n.title}</p>
                              <p className="text-xs text-slate-400 truncate">{n.desc}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={profileRef}>
                <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-[rgba(255,255,255,0.08)] hover:border-[#06B6D4]/30 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#22D3EE] flex items-center justify-center text-white text-xs font-bold">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DF'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-[#1E293B] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
                        <p className="font-semibold text-sm text-white">{userName}</p>
                        <p className="text-xs text-slate-400">{roleLabel}</p>
                      </div>
                      <div className="p-1.5">
                        <Link href="/staff/settings" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}