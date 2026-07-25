'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from '@/components/motion';
import {
  FolderOpen, Upload, Download, Search, FileText, FileImage,
  File, FileSpreadsheet, FileCheck, Receipt, Calendar, HardDrive,
  Filter, X, ArrowUp, ArrowDown, Eye,
} from 'lucide-react';
import PortalShell from '../PortalShell';



interface ProjectFile {
  id: string;
  project_id: number;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  uploaded_by: string;
  created_at: string;
}

interface Project { id: string; name: string; }

const categories = ['All', 'Documents', 'Images', 'Design Assets', 'Contracts', 'Reports', 'Invoices'];

const categoryIcons: Record<string, typeof File> = { Documents: FileText, Images: FileImage, 'Design Assets': FileImage, Contracts: FileCheck, Reports: FileSpreadsheet, Invoices: Receipt };

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FilesPage() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState('Documents');
  const [sortField, setSortField] = useState<'name' | 'created_at' | 'file_size'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client');
      setUserId(session.user.id);
      const { data: projectsData } = await supabase.from('projects').select('id, name').order('created_at', { ascending: false });
      if (projectsData) {
        setProjects(projectsData);
        const projectIds = projectsData.map(p => p.id);
        const { data: filesData } = await supabase.from('project_files').select('*').in('project_id', projectIds).order('created_at', { ascending: false });
        if (filesData) setFiles(filesData);
      }
      setLoading(false);
    }
    init();
  }, []);

  async function handleUpload(file: File) {
    if (!selectedProject) return;
    setUploading(true);
    const filePath = `${selectedProject}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file);
    if (uploadError) { setUploading(false); return; }
    const { data: inserted } = await supabase.from('project_files').insert({
      project_id: Number(selectedProject), name: file.name, file_path: filePath, file_size: file.size,
      file_type: file.type, category: uploadCategory, uploaded_by: userId,
    }).select().single();
    if (inserted) setFiles(prev => [inserted as ProjectFile, ...prev]);
    setUploading(false);
  }

  async function handleDownload(file: ProjectFile) {
    const { data } = await supabase.storage.from('project-files').createSignedUrl(file.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  async function handlePreview(file: ProjectFile) {
    if (file.file_type.startsWith('image/')) {
      const { data } = await supabase.storage.from('project-files').createSignedUrl(file.file_path, 300);
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    } else { handleDownload(file); }
  }

  const filtered = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'file_size') cmp = a.file_size - b.file_size;
    else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalSize = files.reduce((sum, f) => sum + f.file_size, 0);

  function toggleSort(field: 'name' | 'created_at' | 'file_size') {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  if (loading) {
    return (
      <PortalShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">File Centre</h1>
            <p className="text-slate-400 mt-1">{files.length} file{files.length !== 1 ? 's' : ''} · {formatBytes(totalSize)} total</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading || projects.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-white rounded-xl font-medium hover:bg-[#0891B2] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap">
            {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload File</>}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
        </motion.div>

        {projects.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 max-w-sm mx-auto">Files are linked to your projects.</p>
          </motion.div>
        ) : (
          <>
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeCategory === cat ? 'bg-[#06B6D4] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{cat}</button>
                    ))}
                  </div>
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search files..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4]/30 transition-all" />
                  </div>
                </div>
              </motion.div>
            )}

            {files.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No files yet</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">Upload your first file to get started.</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                    className="px-4 py-2.5 pr-8 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:border-[#06B6D4]/30 cursor-pointer">
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
                    className="px-4 py-2.5 pr-8 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:border-[#06B6D4]/30 cursor-pointer">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)] bg-white/[0.02]">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">File</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('file_size')}>
                            <span className="inline-flex items-center gap-1">Size {sortField === 'file_size' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</span>
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors hidden sm:table-cell" onClick={() => toggleSort('created_at')}>
                            <span className="inline-flex items-center gap-1">Uploaded {sortField === 'created_at' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</span>
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((file) => {
                          const CatIcon = categoryIcons[file.category] || File;
                          const projectName = projects.find(p => p.id === String(file.project_id))?.name || 'Unknown';
                          return (
                            <tr key={file.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <CatIcon className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{projectName}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4"><span className="text-sm text-slate-400 whitespace-nowrap">{formatBytes(file.file_size)}</span></td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-400">{file.category}</span>
                              </td>
                              <td className="py-3 px-4 hidden sm:table-cell">
                                <div className="flex flex-col">
                                  <span className="text-sm text-slate-300 whitespace-nowrap">{new Date(file.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  <span className="text-xs text-slate-500">{file.uploaded_by}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {file.file_type.startsWith('image/') && (
                                    <button onClick={() => handlePreview(file)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#06B6D4] hover:bg-[#06B6D4]/5 transition-colors cursor-pointer"><Eye className="w-4 h-4" /></button>
                                  )}
                                  <button onClick={() => handleDownload(file)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#06B6D4] hover:bg-[#06B6D4]/5 transition-colors cursor-pointer"><Download className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {sorted.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No files match your search</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </>
        )}

        {previewUrl && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
            <div className="relative max-w-3xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewUrl(null)} className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[80vh] rounded-2xl object-contain" />
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}