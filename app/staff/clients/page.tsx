'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  Search, RefreshCw, Eye, ChevronDown, X, Mail, Phone,
  Building2, MapPin, Globe, Calendar, User, FolderKanban,
  ArrowRight, Edit2, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../components/staff/StaffShell';



interface Client {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  industry: string | null;
  status: string;
  project_lead: string | null;
  created_at: string;
  project_count?: number;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
}

export default function StaffClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
    const [clientsRes, staffRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('staff_profiles').select('id, full_name'),
      supabase.from('projects').select('client_id'),
    ]);

    if (staffRes.data) setStaff(staffRes.data);

    if (clientsRes.data) {
      const projectCounts: Record<string, number> = {};
      if (projectsRes.data) {
        projectsRes.data.forEach(p => {
          projectCounts[p.client_id] = (projectCounts[p.client_id] || 0) + 1;
        });
      }
      const enriched = clientsRes.data.map(c => ({ ...c, project_count: projectCounts[c.id] || 0 }));
      setClients(enriched);
      setFilteredClients(enriched);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let filtered = clients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        (c.company_name?.toLowerCase().includes(q)) ||
        (c.contact_name?.toLowerCase().includes(q)) ||
        (c.email?.toLowerCase().includes(q)) ||
        (c.industry?.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
    setFilteredClients(filtered);
  }, [searchQuery, statusFilter, clients]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'inactive': return 'bg-gray-50 text-gray-500 border-gray-100';
      case 'prospect': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'on_hold': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    totalProjects: clients.reduce((s, c) => s + (c.project_count || 0), 0),
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your client relationships</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Clients', value: stats.total, color: '#2563EB' },
            { label: 'Active', value: stats.active, color: '#10B981' },
            { label: 'Total Projects', value: stats.totalProjects, color: '#8B5CF6' },
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
                placeholder="Search by company, contact, email, or industry..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                  <option value="on_hold">On Hold</option>
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
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const leadStaff = staff.find(s => s.id === client.project_lead);
                  return (
                    <tr key={client.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 flex items-center justify-center text-xs font-bold text-[#10B981] shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{client.company_name || 'Unnamed'}</p>
                            {client.website && (
                              <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" className="text-xs text-[#2563EB] hover:underline">{client.website}</a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm font-medium text-slate-300">{client.contact_name || '-'}</p>
                        <p className="text-xs text-slate-400">{client.email || '-'}</p>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-400">{client.industry || '-'}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(client.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: client.status === 'active' ? '#10B981' : '#9CA3AF' }} />
                          {client.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg text-xs font-medium text-slate-400">
                          <FolderKanban className="w-3 h-3" />
                          {client.project_count || 0}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedClient(client)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link href={`/staff/projects?client=${client.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                          >
                            <FolderKanban className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-1">No clients found</p>
              <p className="text-sm text-slate-500">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Convert a lead to get started'}</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedClient && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedClient(null)}
            >
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Client Details</h3>
                    <button onClick={() => setSelectedClient(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 flex items-center justify-center text-xl font-bold text-[#10B981]">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{selectedClient.company_name || 'Unnamed'}</p>
                      <p className="text-sm text-slate-500">{selectedClient.industry || 'No industry'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Contact', value: selectedClient.contact_name },
                      { label: 'Email', value: selectedClient.email },
                      { label: 'Phone', value: selectedClient.phone },
                      { label: 'Website', value: selectedClient.website },
                      { label: 'Address', value: selectedClient.address },
                      { label: 'Projects', value: selectedClient.project_count?.toString() || '0' },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-slate-300">{item.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {selectedClient.email && (
                      <a href={`mailto:${selectedClient.email}`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Mail className="w-4 h-4" /> Email Client
                      </a>
                    )}
                    <Link href={`/staff/projects?client=${selectedClient.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <FolderKanban className="w-4 h-4" /> View Projects
                    </Link>
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