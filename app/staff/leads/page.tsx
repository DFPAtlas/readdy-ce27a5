'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  Search, Filter, RefreshCw, Eye, Trash2, ChevronDown,
  UserCheck, X, Mail, Phone, Building2, MapPin, Globe,
  Calendar, ArrowUpRight, Loader2, CheckCircle, UserPlus, DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../components/staff/StaffShell';



interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  service_interest: string | null;
  message: string | null;
  budget_range: string | null;
  location: string | null;
  status: string;
  assigned_to: string | null;
  source: string;
  created_at: string;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  role: string;
}

export default function StaffLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [convertError, setConvertError] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      const { data: sp } = await supabase.from('staff_profiles').select('id').eq('id', session.user.id).maybeSingle();
      if (!sp) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      await fetchData();
    }
    init();
  }, [router]);

  const fetchData = async () => {
    const [leadsRes, staffRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('staff_profiles').select('id, full_name, role'),
    ]);
    if (leadsRes.data) { setLeads(leadsRes.data); setFilteredLeads(leadsRes.data); }
    if (staffRes.data) setStaff(staffRes.data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let filtered = leads;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.company_name?.toLowerCase().includes(q)) ||
        (l.service_interest?.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(l => l.status === statusFilter);
    setFilteredLeads(filtered);
  }, [searchQuery, statusFilter, leads]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleAssign = async (id: string, staffId: string) => {
    const { error } = await supabase.from('leads').update({ assigned_to: staffId || null, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) setLeads(prev => prev.map(l => l.id === id ? { ...l, assigned_to: staffId || null } : l));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead permanently?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleConvertToClient = async (lead: Lead) => {
    setConverting(true);
    setConvertError('');

    const clientId = crypto.randomUUID();

    const { error: clientErr } = await supabase.from('clients').insert({
      id: clientId,
      company_name: lead.company_name || lead.name,
      contact_name: lead.name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      industry: lead.service_interest || null,
      status: 'active',
      lead_id: lead.id,
      notes: lead.message || null,
    });

    if (clientErr) {
      setConvertError('Failed to create client: ' + clientErr.message);
      setConverting(false);
      return;
    }

    const projectId = Date.now();
    const { error: projectErr } = await supabase.from('projects').insert({
      id: projectId,
      client_id: clientId,
      name: `${lead.company_name || lead.name} — ${lead.service_interest || 'New Project'}`,
      description: lead.message || 'Project created from lead conversion.',
      status: 'planning',
      budget: 0,
      project_lead: lead.assigned_to || null,
    });

    if (projectErr) {
      setConvertError('Client created but project failed: ' + projectErr.message);
      setConverting(false);
      return;
    }

    const { error: accessErr } = await supabase.from('project_access').insert({
      project_id: projectId,
      client_id: clientId,
      access_level: 'full',
    });

    const { error: activityErr } = await supabase.from('project_activity').insert({
      project_id: projectId,
      description: 'Project created from lead conversion',
      activity_type: 'project_created',
    });

    await supabase.from('leads').update({
      status: 'converted',
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id);

    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l));
    setConvertSuccess(true);
    setConverting(false);

    setTimeout(() => { setConvertSuccess(false); setSelectedLead(null); }, 2500);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'contacted': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'qualified': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'converted': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'closed': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const stats = {
    total: leads.length,
    newCount: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
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

  return (
    <StaffShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track, manage, and convert incoming enquiries</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, color: '#94A3B8' },
            { label: 'New', value: stats.newCount, color: '#06B6D4' },
            { label: 'Contacted', value: stats.contacted, color: '#F59E0B' },
            { label: 'Qualified', value: stats.qualified, color: '#10B981' },
            { label: 'Converted', value: stats.converted, color: '#7C3AED' },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 lg:p-5 border-b border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, company, or service..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/15 focus:border-[#06B6D4]/30 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                  className="px-4 pr-8 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/15 cursor-pointer appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}
                className="px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4]/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const assignedStaff = staff.find(s => s.id === lead.assigned_to);
                  return (
                    <tr key={lead.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06B6D4]/10 to-[#06B6D4]/10 flex items-center justify-center text-xs font-bold text-[#06B6D4] shrink-0">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{lead.name}</p>
                            <p className="text-xs text-slate-400">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {lead.company_name || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-400">{lead.service_interest || '-'}</td>
                      <td className="py-4 px-5 text-sm text-slate-400">{lead.budget_range || '-'}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(lead.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{
                            backgroundColor: lead.status === 'new' ? '#2563EB' : lead.status === 'contacted' ? '#F59E0B' : lead.status === 'qualified' ? '#10B981' : lead.status === 'converted' ? '#8B5CF6' : '#9CA3AF'
                          }} />
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={lead.assigned_to || ''}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAssign(lead.id, e.target.value)}
                          className="px-2 py-1 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-white cursor-pointer pr-6"
                        >
                          <option value="">Unassigned</option>
                          {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedLead(lead)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#06B6D4] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {lead.status !== 'converted' && (
                            <button onClick={() => handleConvertToClient(lead)}
                              disabled={converting}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#10B981]/10 text-slate-400 hover:text-[#10B981] transition-colors cursor-pointer"
                              title="Convert to Client"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(lead.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EF4444]/10 text-slate-400 hover:text-[#EF4444] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-16">
              <UserCheck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-1">No leads found</p>
              <p className="text-sm text-slate-500">
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Leads will appear here when someone submits the contact form'}
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedLead && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLead(null)}
            >
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Lead Details</h3>
                    <button onClick={() => setSelectedLead(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06B6D4]/10 to-[#06B6D4]/10 flex items-center justify-center text-xl font-bold text-[#06B6D4] shrink-0">
                      {selectedLead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{selectedLead.name}</p>
                      <p className="text-sm text-slate-500">{selectedLead.email}</p>
                    </div>
                    <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Company', value: selectedLead.company_name, icon: Building2 },
                      { label: 'Phone', value: selectedLead.phone, icon: Phone },
                      { label: 'Website', value: selectedLead.website, icon: Globe },
                      { label: 'Location', value: selectedLead.location, icon: MapPin },
                      { label: 'Service Interest', value: selectedLead.service_interest, icon: ArrowUpRight },
                      { label: 'Budget Range', value: selectedLead.budget_range, icon: DollarSign },
                      { label: 'Source', value: selectedLead.source, icon: Globe },
                      { label: 'Date', value: selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', icon: Calendar },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                        <div className="flex items-center gap-1.5">
                          <item.icon className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-sm font-medium text-slate-300">{item.value || '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedLead.message && (
                    <div className="mb-6">
                      <p className="text-xs text-slate-400 mb-1">Message</p>
                      <div className="p-3 bg-white/5 rounded-xl text-sm text-slate-400">{selectedLead.message}</div>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-xs text-slate-400 mb-2">Assigned To</p>
                    <select
                      value={selectedLead.assigned_to || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { handleAssign(selectedLead.id, e.target.value); setSelectedLead({ ...selectedLead, assigned_to: e.target.value || null }); }}
                      className="px-3 py-2 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white cursor-pointer pr-8"
                    >
                      <option value="">Unassigned</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)} ({s.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-slate-400 mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {['new', 'contacted', 'qualified', 'closed'].map(s => (
                        <button key={s}
                          onClick={() => { handleStatusChange(selectedLead.id, s); setSelectedLead({ ...selectedLead, status: s }); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors cursor-pointer ${selectedLead.status === s ? getStatusStyle(s) : 'bg-transparent text-slate-400 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {convertSuccess && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 mb-4"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Client created successfully!</p>
                        <p className="text-xs text-emerald-600">Client profile, project, and access have been set up.</p>
                      </div>
                    </motion.div>
                  )}

                  {convertError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">{convertError}</div>
                  )}

                  <div className="flex gap-3">
                    {selectedLead.status !== 'converted' && (
                      <button onClick={() => handleConvertToClient(selectedLead)} disabled={converting}
                        className="flex-1 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-xl font-bold text-white hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                      >
                        {converting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Convert to Client
                          </>
                        )}
                      </button>
                    )}
                    {selectedLead.email && (
                      <a href={`mailto:${selectedLead.email}`}
                        className="flex items-center gap-2 px-5 py-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    )}
                    <button onClick={() => setSelectedLead(null)}
                      className="px-5 py-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StaffShell>
  );
}