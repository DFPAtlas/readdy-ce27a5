import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Bug,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Gauge,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  MonitorSmartphone,
  Play,
  Send,
  Smartphone,
  Trophy,
  UserRound,
  WalletCards,
} from 'lucide-react';

const assignments = [
  { title: 'E-commerce Checkout Flow', subtitle: 'Test the complete checkout process', type: 'Website', devices: 'Desktop + mobile', time: '60 mins', reward: '£30', icon: MonitorSmartphone },
  { title: 'Mobile Sign-up & Forms', subtitle: 'Test registration and profile forms', type: 'Mobile app', devices: 'Mobile', time: '45 mins', reward: '£20', icon: Smartphone },
  { title: 'Client Portal Dashboard', subtitle: 'Test dashboard navigation and key features', type: 'Website', devices: 'Desktop + tablet', time: '75 mins', reward: '£35', icon: LayoutDashboard },
];

const reports = [
  { id: 'BUG-1042', title: 'Payment option fails to load', assignment: 'E-commerce Checkout', submitted: 'Sample date', status: 'Pending Review', reward: '—', tone: 'bg-amber-100 text-amber-700' },
  { id: 'BUG-1037', title: 'Email validation error', assignment: 'Mobile Sign-up & Forms', submitted: 'Sample date', status: 'Approved', reward: '£20', tone: 'bg-emerald-100 text-emerald-700' },
  { id: 'BUG-1031', title: 'Dashboard chart misaligned', assignment: 'Client Portal Dashboard', submitted: 'Sample date', status: 'Duplicate', reward: '—', tone: 'bg-sky-100 text-sky-700' },
];

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Test Assignments', icon: FileCheck2 },
  { label: 'Bug Reports', icon: Bug },
  { label: 'Payments', icon: WalletCards },
  { label: 'Messages', icon: MessageCircle, badge: '2' },
  { label: 'Resources', icon: BookOpen },
  { label: 'Profile', icon: UserRound },
];

export default function UATTesterPortalPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#17325c]">
      <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-900">
        <strong>Portal preview:</strong> this screen uses sample data. Tester sign-in, live assignments and payments will be connected after the DFP Supabase service is restored.
      </div>

      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur lg:px-8">
        <div className="flex items-center gap-5">
          <Link href="/uat-testing" className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#2878d0]"><ArrowLeft className="h-4 w-4" /> UAT Network</Link>
          <Link href="/" className="hidden items-center gap-2 text-xl font-bold text-[#2878d0] sm:flex">DFP <span className="font-normal text-slate-300">/</span> <span className="text-sm font-medium text-[#17325c]">Digital Footprint</span></Link>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Preview notifications" className="relative rounded-full p-2 text-[#17325c] hover:bg-slate-100"><Bell className="h-5 w-5" /><span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#2878d0] text-[10px] font-bold text-white">3</span></button>
          <button type="button" className="flex items-center gap-3 rounded-full bg-white py-1 pl-1 pr-3 hover:bg-slate-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0e1] font-bold text-[#617a50]">ST</span>
            <span className="hidden text-left sm:block"><span className="block text-sm font-semibold">Sample Tester</span><span className="block text-xs text-[#6f8d5c]">Preview account</span></span><ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-100 bg-white p-5 lg:flex lg:flex-col">
          <nav className="space-y-2">
            {nav.map(({ label, icon: Icon, active, badge }) => (
              <button type="button" key={label} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${active ? 'bg-[#edf5ff] text-[#2878d0]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#17325c]'}`}>
                <Icon className="h-5 w-5" /><span className="flex-1">{label}</span>{badge && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2878d0] text-[10px] text-white">{badge}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-5 pt-8">
            <div className="rounded-2xl bg-gradient-to-br from-[#edf5ff] to-[#eef4e9] p-5 text-center"><MonitorSmartphone className="mx-auto h-12 w-12 text-[#2878d0]" /><p className="mt-3 font-serif text-xl font-semibold">Better products start with real people.</p><p className="mt-2 text-xs leading-5 text-slate-500">Thank you for helping DFP improve digital experiences.</p></div>
            <div className="rounded-2xl border border-slate-200 p-4"><p className="font-semibold">Need help?</p><p className="mt-1 text-sm text-slate-500">Support features will be available in the live portal.</p><button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><Headphones className="h-4 w-4" /> Help & Support</button></div>
          </div>
        </aside>

        <section className="min-w-0 p-5 sm:p-7 lg:p-9">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#789265]">Sample dashboard</p><h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Welcome, <span className="text-[#789265]">Tester</span></h1><p className="mt-2 text-slate-500">This preview shows how testing work, bug reports and rewards will appear.</p></div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"><CalendarDays className="h-5 w-5 text-[#2878d0]" /><div><p className="text-xs text-slate-400">Payout schedule</p><p className="text-sm font-semibold">Twice monthly</p></div></div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: FileCheck2, value: '5', label: 'Available Tests', note: 'Sample assignments', tone: 'bg-sky-100 text-[#2878d0]' },
                { icon: Send, value: '12', label: 'Submitted Reports', note: 'Example history', tone: 'bg-[#e8f0e1] text-[#6f8d5c]' },
                { icon: Trophy, value: '7', label: 'Approved Bugs', note: 'Example result', tone: 'bg-amber-100 text-amber-700' },
                { icon: WalletCards, value: '£68.50', label: 'Example Balance', note: 'Not a real balance', tone: 'bg-sky-100 text-[#2878d0]' },
              ].map(({ icon: Icon, value, label, note, tone }) => <article key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className={`flex h-14 w-14 items-center justify-center rounded-full ${tone}`}><Icon className="h-6 w-6" /></div><div><p className="text-2xl font-bold">{value}</p><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div></article>)}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-serif text-2xl font-semibold">Available Assignments</h2><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preview</span></div>
                  <div className="divide-y divide-slate-100">
                    {assignments.map(({ title, subtitle, type, devices, time, reward, icon: Icon }, index) => <div key={title} className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(240px,1.5fr)_0.7fr_0.8fr_0.55fr_0.5fr_auto] md:items-center">
                      <div className="flex items-center gap-3"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${index % 3 === 0 ? 'bg-sky-100' : index % 3 === 1 ? 'bg-[#e8f0e1]' : 'bg-amber-100'}`}><Icon className="h-5 w-5 text-[#17325c]" /></div><div><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div></div>
                      <p className="text-sm text-slate-500">{type}</p><p className="text-sm text-slate-500">{devices}</p><p className="flex items-center gap-1 text-sm text-slate-500"><Clock3 className="h-4 w-4" />{time}</p><span className="w-fit rounded-lg bg-[#edf4e8] px-3 py-1 text-sm font-bold text-[#617a50]">{reward}</span><button type="button" className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">Preview</button>
                    </div>)}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-serif text-2xl font-semibold">Recent Bug Reports</h2><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sample data</span></div>
                  <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Bug ID</th><th className="px-5 py-3">Title</th><th className="px-5 py-3">Assignment</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Reward</th></tr></thead><tbody className="divide-y divide-slate-100">{reports.map((report) => <tr key={report.id}><td className="px-5 py-4 font-semibold text-[#2878d0]">{report.id}</td><td className="px-5 py-4 font-medium">{report.title}</td><td className="px-5 py-4 text-slate-500">{report.assignment}</td><td className="px-5 py-4 text-slate-500">{report.submitted}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.tone}`}>{report.status}</span></td><td className="px-5 py-4 font-semibold">{report.reward}</td></tr>)}</tbody></table></div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold">Tester Score</h2><Gauge className="h-5 w-5 text-[#2878d0]" /></div><div className="mx-auto mt-5 flex h-36 w-36 flex-col items-center justify-center rounded-full border-[10px] border-[#86a66f] bg-white"><span className="text-4xl font-bold">92</span><span className="text-xs text-slate-500">Sample score</span></div><div className="mt-6 space-y-3">{['High-quality reports', 'Timely submissions', 'Helpful feedback'].map((item) => <p key={item} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 text-[#789265]" />{item}</p>)}</div></section>

                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold">Payments</h2><CircleDollarSign className="h-5 w-5 text-[#789265]" /></div><div className="mt-5 space-y-4"><div className="flex items-center gap-3"><WalletCards className="h-5 w-5 text-[#789265]" /><span className="flex-1 text-sm text-slate-500">Example balance</span><span className="font-semibold">£68.50</span></div><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-[#789265]" /><span className="flex-1 text-sm text-slate-500">Payout cycle</span><span className="font-semibold">Twice monthly</span></div></div><p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">No live payment account or balance is connected to this preview.</p></section>
              </aside>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl font-semibold">Quick Actions</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
              [Play, 'Start Test', 'Browse suitable assignments'], [Bug, 'Submit Bug', 'Report an issue with evidence'], [WalletCards, 'View Payments', 'Check earnings and history'], [MessageCircle, 'Messages', 'Read project communications'],
            ].map(([Icon, title, copy]) => { const ActionIcon = Icon as typeof Play; return <button type="button" key={title as string} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left text-slate-500"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100"><ActionIcon className="h-5 w-5 text-[#2878d0]" /></div><span><span className="block font-semibold text-[#17325c]">{title as string}</span><span className="mt-1 block text-xs text-slate-500">{copy as string}</span></span></button>; })}</div></section>
          </div>
        </section>
      </div>
    </main>
  );
}
