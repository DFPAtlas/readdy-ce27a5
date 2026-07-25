'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  ArrowLeft, ArrowRight, Check, Save, Loader2,
  Building2, Briefcase, Wrench, Target, ListChecks,
  Cpu, PoundSterling, Lightbulb, Sparkles, User,
  Mail, Phone, MapPin, Globe, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../../components/staff/StaffShell';



interface Client {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  industry: string | null;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  role: string;
}

interface WizardData {
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  business_overview: string;
  target_customers: string;
  problem_statement: string;
  current_systems: string;
  pain_points: string;
  services: string[];
  goals: string[];
  required_pages: string;
  required_features: string;
  integrations: string;
  user_roles_text: string;
  admin_dashboard: boolean;
  client_portal: boolean;
  payment_required: boolean;
  email_required: boolean;
  file_upload_required: boolean;
  domain: string;
  hosting: string;
  email_tech: string;
  database_tech: string;
  supabase_needed: boolean;
  stripe_needed: boolean;
  n8n_needed: boolean;
  ai_agents: string;
  storage_req: string;
  backups: string;
  security_req: string;
  budget_range: string;
  payment_plan: string;
  target_start: string;
  target_launch: string;
  priority_level: string;
  ai_opportunities: string;
  automation_opportunities: string;
  future_features: string;
  support_package: string;
  ongoing_maintenance: string;
}

const serviceOptions = [
  'Website Development', 'AI Automation', 'Business Automation',
  'Custom Software', 'Cloud Infrastructure', 'IT Support',
  'Cyber Security', 'CCTV & Security Systems', 'Digital Transformation Consultancy',
];

const goalOptions = [
  'Increase leads', 'Save time', 'Reduce admin',
  'Improve security', 'Improve customer service', 'Automate workflows',
  'Modernise systems', 'Launch new platform',
];

const steps = [
  { num: 1, title: 'Client Details', icon: User },
  { num: 2, title: 'Business Overview', icon: Building2 },
  { num: 3, title: 'Services Required', icon: Wrench },
  { num: 4, title: 'Project Goals', icon: Target },
  { num: 5, title: 'Project Scope', icon: ListChecks },
  { num: 6, title: 'Technical Requirements', icon: Cpu },
  { num: 7, title: 'Budget & Timeline', icon: PoundSterling },
  { num: 8, title: 'Roadmap Opportunities', icon: Lightbulb },
  { num: 9, title: 'Generate Project', icon: Sparkles },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedProjectId, setGeneratedProjectId] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    client_id: '',
    company_name: '', contact_name: '', email: '', phone: '',
    address: '', website: '', industry: '',
    business_overview: '', target_customers: '', problem_statement: '',
    current_systems: '', pain_points: '',
    services: [],
    goals: [],
    required_pages: '', required_features: '', integrations: '',
    user_roles_text: '',
    admin_dashboard: false, client_portal: true, payment_required: false,
    email_required: false, file_upload_required: false,
    domain: '', hosting: '', email_tech: '', database_tech: '',
    supabase_needed: false, stripe_needed: false, n8n_needed: false,
    ai_agents: '', storage_req: '', backups: '', security_req: '',
    budget_range: '', payment_plan: '', target_start: '', target_launch: '', priority_level: 'medium',
    ai_opportunities: '', automation_opportunities: '', future_features: '',
    support_package: '', ongoing_maintenance: '',
  });

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      const { data: sp } = await supabase.from('staff_profiles').select('id').eq('id', session.user.id).maybeSingle();
      if (!sp) { setTimeout(() => router.replace('/staff/login'), 0); return; }

      const [clientsRes, staffRes] = await Promise.all([
        supabase.from('clients').select('id, company_name, contact_name, email, phone, address, website, industry').order('created_at', { ascending: false }),
        supabase.from('staff_profiles').select('id, full_name, role'),
      ]);
      if (clientsRes.data) setClients(clientsRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      setLoading(false);
    }
    init();
  }, [router]);

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setData(prev => ({
        ...prev,
        client_id: clientId,
        company_name: client.company_name || '',
        contact_name: client.contact_name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        website: client.website || '',
        industry: client.industry || '',
      }));
    }
  };

  const toggleService = (s: string) => {
    setData(prev => ({
      ...prev,
      services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s],
    }));
  };

  const toggleGoal = (g: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(g) ? prev.goals.filter(x => x !== g) : [...prev.goals, g],
    }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 9));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    const projectId = Date.now();

    const stepData = {
      client_details: {
        company_name: data.company_name, contact_name: data.contact_name,
        email: data.email, phone: data.phone, address: data.address,
        website: data.website, industry: data.industry,
      },
      business_overview: {
        overview: data.business_overview, customers: data.target_customers,
        problem: data.problem_statement, systems: data.current_systems, pain_points: data.pain_points,
      },
      services: data.services,
      goals: data.goals,
      scope: {
        pages: data.required_pages, features: data.required_features,
        integrations: data.integrations, user_roles: data.user_roles_text,
        admin_dashboard: data.admin_dashboard, client_portal: data.client_portal,
        payment: data.payment_required, email: data.email_required, file_upload: data.file_upload_required,
      },
      technical: {
        domain: data.domain, hosting: data.hosting, email: data.email_tech,
        database: data.database_tech, supabase: data.supabase_needed,
        stripe: data.stripe_needed, n8n: data.n8n_needed, ai: data.ai_agents,
        storage: data.storage_req, backups: data.backups, security: data.security_req,
      },
      budget: {
        range: data.budget_range, plan: data.payment_plan,
        start: data.target_start, launch: data.target_launch, priority: data.priority_level,
      },
      roadmap: {
        ai: data.ai_opportunities, automation: data.automation_opportunities,
        future: data.future_features, support: data.support_package, maintenance: data.ongoing_maintenance,
      },
    };

    const clientId = data.client_id || crypto.randomUUID();

    if (!data.client_id) {
      await supabase.from('clients').insert({
        id: clientId,
        company_name: data.company_name || 'New Client',
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        industry: data.industry,
        status: 'active',
      });
    }

    const { error: projectErr } = await supabase.from('projects').insert({
      id: projectId,
      client_id: clientId,
      name: `${data.company_name || 'New Client'} — ${data.services.length > 0 ? data.services[0] : 'New Project'}`,
      description: data.business_overview || 'Project created via discovery wizard.',
      status: 'planning',
      budget: data.budget_range ? parseInt(data.budget_range.replace(/[^0-9]/g, '')) || 0 : 0,
      start_date: data.target_start || null,
      end_date: data.target_launch || null,
      progress: 0,
      project_lead: null,
    });

    if (projectErr) {
      setGenerating(false);
      setGenerateError('Failed to create project: ' + projectErr.message);
      return;
    }

    await supabase.from('project_access').insert({
      project_id: projectId,
      client_id: clientId,
      access_level: 'full',
    });

    await supabase.from('project_discovery').insert({
      project_id: projectId,
      client_id: clientId,
      step_data: stepData,
      completed_steps: 9,
      completed: true,
    });

    await supabase.from('project_requirements').insert({
      project_id: projectId,
      required_pages: data.required_pages ? data.required_pages.split(',').map(s => s.trim()) : [],
      required_features: data.required_features ? data.required_features.split(',').map(s => s.trim()) : [],
      integrations: data.integrations ? data.integrations.split(',').map(s => s.trim()) : [],
      user_roles: data.user_roles_text ? data.user_roles_text.split(',').map(s => s.trim()) : [],
      admin_dashboard: data.admin_dashboard,
      client_portal: data.client_portal,
      payment_required: data.payment_required,
      email_required: data.email_required,
      file_upload_required: data.file_upload_required,
    });

    await supabase.from('project_activity').insert({
      project_id: projectId,
      description: 'Project created from Discovery Wizard',
      activity_type: 'project_created',
    });

    const roadmapItems = [
      ...data.services.map(s => ({ title: s, category: 'service', priority: 'high' })),
    ];
    for (const item of roadmapItems) {
      await supabase.from('technology_roadmap').insert({
        client_id: clientId,
        project_id: projectId,
        title: item.title,
        description: `Discovery wizard recommendation: ${item.title}`,
        category: item.category,
        priority: item.priority,
        status: 'proposed',
        target_date: data.target_launch || null,
      });
    }

    setGeneratedProjectId(String(projectId));
    setGenerated(true);
    setGenerating(false);
  };

  if (loading) {
    return (
      <StaffShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
        </div>
      </StaffShell>
    );
  }

  if (generated) {
    return (
      <StaffShell>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Project Created!</h1>
            <p className="text-slate-500 mb-2">The project, client profile, and all configurations have been set up.</p>
            <p className="text-sm text-slate-400 mb-8">Discovery data, requirements, roadmap items, and activity log are all recorded.</p>
            <div className="flex gap-4 justify-center">
              <Link href={`/staff/projects/${generatedProjectId}`}
                className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#2563EB]/20 transition-all cursor-pointer whitespace-nowrap"
              >
                View Project
              </Link>
              <Link href="/staff/projects/new"
                className="px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Create Another
              </Link>
            </div>
          </motion.div>
        </div>
      </StaffShell>
    );
  }

  return (
    <StaffShell>
      {generateError && (
        <div className="mb-6 flex items-center justify-between px-4 py-3 rounded-xl text-sm border bg-red-100 text-red-700 border-red-200">
          <span>{generateError}</span>
          <button onClick={() => setGenerateError(null)} className="ml-3 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0" aria-label="Dismiss">
            <i className="ri-close-line w-4 h-4 flex items-center justify-center" />
          </button>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/staff/projects" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-white">Discovery Wizard</h1>
          <p className="text-sm text-slate-400 mt-0.5">One Contact. One Relationship. One Vision.</p>
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;
            return (
              <div key={step.num} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => currentStep > step.num && setCurrentStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-[#2563EB] text-white' : isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>

              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 1 — Client Details</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Select Existing Client (optional)</label>
                    <select
                      value={data.client_id}
                      onChange={(e) => handleClientSelect(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white cursor-pointer pr-8"
                    >
                      <option value="">Create New Client</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.company_name || c.contact_name || c.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Company Name *', key: 'company_name', icon: Building2 },
                      { label: 'Contact Name *', key: 'contact_name', icon: User },
                      { label: 'Email *', key: 'email', icon: Mail, type: 'email' },
                      { label: 'Phone', key: 'phone', icon: Phone },
                      { label: 'Address', key: 'address', icon: MapPin },
                      { label: 'Website', key: 'website', icon: Globe },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">{field.label}</label>
                        <div className="relative">
                          <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={field.type || 'text'}
                            value={(data as any)[field.key]}
                            onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                            placeholder={field.label.replace(' *', '')}
                          />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Industry</label>
                      <select
                        value={data.industry}
                        onChange={(e) => setData(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer pr-8"
                      >
                        <option value="">Select industry</option>
                        {['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Real Estate', 'Education', 'Hospitality', 'Legal', 'Construction', 'Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 2 — Business Overview</h2>
                  {[
                    { label: 'What does the business do?', key: 'business_overview' },
                    { label: 'Who are their customers?', key: 'target_customers' },
                    { label: 'What problem are they trying to solve?', key: 'problem_statement' },
                    { label: 'Current systems used', key: 'current_systems' },
                    { label: 'Current pain points', key: 'pain_points' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{field.label}</label>
                      <textarea
                        value={(data as any)[field.key]}
                        onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all resize-none"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 3 — Services Required</h2>
                  <p className="text-sm text-slate-500">Select all services the client is interested in:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceOptions.map(s => {
                      const selected = data.services.includes(s);
                      return (
                        <button key={s} onClick={() => toggleService(s)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                            selected ? 'bg-[#2563EB]/5 border-[#2563EB]/30 text-[#2563EB]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-[#2563EB] border-[#2563EB]' : 'border-slate-300'}`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 4 — Project Goals</h2>
                  <p className="text-sm text-slate-500">What does the client want to achieve?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goalOptions.map(g => {
                      const selected = data.goals.includes(g);
                      return (
                        <button key={g} onClick={() => toggleGoal(g)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                            selected ? 'bg-[#2563EB]/5 border-[#2563EB]/30 text-[#2563EB]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-[#2563EB] border-[#2563EB]' : 'border-slate-300'}`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 5 — Project Scope</h2>
                  {[
                    { label: 'Required pages (comma separated)', key: 'required_pages', placeholder: 'Home, About, Services, Contact, Blog' },
                    { label: 'Required features (comma separated)', key: 'required_features', placeholder: 'Search, Filtering, User accounts, Payment' },
                    { label: 'Integrations needed (comma separated)', key: 'integrations', placeholder: 'Stripe, Mailchimp, Google Analytics, CRM' },
                    { label: 'User roles (comma separated)', key: 'user_roles_text', placeholder: 'Admin, Manager, Staff, Customer' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        value={(data as any)[field.key]}
                        onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Admin Dashboard', key: 'admin_dashboard' },
                      { label: 'Client Portal', key: 'client_portal' },
                      { label: 'Payment System', key: 'payment_required' },
                      { label: 'Email System', key: 'email_required' },
                      { label: 'File Upload', key: 'file_upload_required' },
                    ].map(item => (
                      <button key={item.key} onClick={() => setData(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          (data as any)[item.key] ? 'bg-[#2563EB]/5 border-[#2563EB]/30 text-[#2563EB]' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${(data as any)[item.key] ? 'bg-[#2563EB] border-[#2563EB]' : 'border-slate-300'}`}>
                          {(data as any)[item.key] && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 6 — Technical Requirements</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Domain', key: 'domain', placeholder: 'example.com' },
                      { label: 'Hosting', key: 'hosting', placeholder: 'Vercel, AWS, etc.' },
                      { label: 'Email Provider', key: 'email_tech', placeholder: 'Google Workspace, Microsoft 365' },
                      { label: 'Database', key: 'database_tech', placeholder: 'PostgreSQL, MySQL, etc.' },
                      { label: 'AI Agents (details)', key: 'ai_agents', placeholder: 'Chatbot, voice assistant, etc.' },
                      { label: 'Storage Requirements', key: 'storage_req', placeholder: 'File storage, media, etc.' },
                      { label: 'Backup Requirements', key: 'backups', placeholder: 'Daily, weekly, etc.' },
                      { label: 'Security Requirements', key: 'security_req', placeholder: 'SSL, 2FA, SOC2, etc.' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">{field.label}</label>
                        <input
                          type="text"
                          value={(data as any)[field.key]}
                          onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['supabase_needed', 'stripe_needed', 'n8n_needed'].map(key => (
                      <button key={key} onClick={() => setData(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          (data as any)[key] ? 'bg-[#2563EB]/5 border-[#2563EB]/30 text-[#2563EB]' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${(data as any)[key] ? 'bg-[#2563EB] border-[#2563EB]' : 'border-slate-300'}`}>
                          {(data as any)[key] && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {key === 'supabase_needed' ? 'Supabase' : key === 'stripe_needed' ? 'Stripe' : 'n8n'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 7 — Budget & Timeline</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Budget Range</label>
                      <select
                        value={data.budget_range}
                        onChange={(e) => setData(prev => ({ ...prev, budget_range: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer pr-8"
                      >
                        <option value="">Select range</option>
                        {['£1,000 - £5,000', '£5,000 - £15,000', '£15,000 - £30,000', '£30,000 - £50,000', '£50,000 - £100,000', '£100,000+'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Payment Plan</label>
                      <select
                        value={data.payment_plan}
                        onChange={(e) => setData(prev => ({ ...prev, payment_plan: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer pr-8"
                      >
                        <option value="">Select plan</option>
                        {['Upfront (100%)', '50% upfront / 50% on completion', 'Milestone-based', 'Monthly retainer', 'Quarterly'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Target Start Date</label>
                      <input type="date" value={data.target_start} onChange={(e) => setData(prev => ({ ...prev, target_start: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Target Launch Date</label>
                      <input type="date" value={data.target_launch} onChange={(e) => setData(prev => ({ ...prev, target_launch: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Priority Level</label>
                      <select
                        value={data.priority_level}
                        onChange={(e) => setData(prev => ({ ...prev, priority_level: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer pr-8"
                      >
                        {['low', 'medium', 'high', 'urgent'].map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Step 8 — Roadmap Opportunities</h2>
                  {[
                    { label: 'AI Opportunities', key: 'ai_opportunities', placeholder: 'AI chatbot, automated lead scoring, predictive analytics...' },
                    { label: 'Automation Opportunities', key: 'automation_opportunities', placeholder: 'Email automation, document generation, workflow automation...' },
                    { label: 'Future Features', key: 'future_features', placeholder: 'Mobile app, API access, reporting dashboard...' },
                    { label: 'Support Package', key: 'support_package', placeholder: 'Basic, Standard, Premium, 24/7...' },
                    { label: 'Ongoing Maintenance', key: 'ongoing_maintenance', placeholder: 'Monthly updates, security patches, content updates...' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{field.label}</label>
                      <textarea
                        value={(data as any)[field.key]}
                        onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all resize-none"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 9 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Step 9 — Generate Project</h2>
                  <p className="text-sm text-slate-500">Review the summary and click generate to create everything.</p>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Client</p>
                      <p className="font-medium text-slate-900">{data.company_name || 'New Client'}</p>
                      <p className="text-sm text-slate-500">{data.contact_name} · {data.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Services Selected</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.services.length > 0 ? data.services.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-[#2563EB]/10 text-[#2563EB] rounded-lg text-xs font-medium">{s}</span>
                        )) : <span className="text-sm text-slate-400">None selected</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Goals</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.goals.length > 0 ? data.goals.map(g => (
                          <span key={g} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">{g}</span>
                        )) : <span className="text-sm text-slate-400">None selected</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Budget & Timeline</p>
                      <p className="text-sm text-slate-700">{data.budget_range || 'Not set'} · {data.payment_plan || 'Not set'}</p>
                      <p className="text-sm text-slate-500">{data.target_start ? `Start: ${data.target_start}` : ''} {data.target_launch ? ` → Launch: ${data.target_launch}` : ''}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400">This will create: client profile, project record, milestones, tasks, roadmap items, project brief, and activity log.</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={handleBack} disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 9 ? (
              <button onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#2563EB]/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleGenerate} disabled={generating}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Project
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}