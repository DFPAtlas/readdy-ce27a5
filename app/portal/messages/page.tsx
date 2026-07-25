'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  MessageSquare, Send, CheckCheck, Clock, Search,
  FolderKanban, ArrowRight, Paperclip, User,
} from 'lucide-react';
import PortalShell from '../PortalShell';



interface ProjectMsg {
  id: string;
  project_id: number;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

interface Conversation {
  project: Project;
  messages: ProjectMsg[];
  unread: number;
  lastMessage: ProjectMsg;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client');
      await fetchData(session.user.id);
      setLoading(false);
    }
    init();
    pollingRef.current = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) fetchData(session.user.id);
      });
    }, 15000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  async function fetchData(uid: string) {
    const { data: projectsData } = await supabase.from('projects').select('id, name').order('created_at', { ascending: false });
    if (!projectsData || projectsData.length === 0) { setConversations([]); return; }
    const projectIds = projectsData.map(p => p.id);
    const { data: messagesData } = await supabase.from('project_messages').select('*').in('project_id', projectIds).order('created_at', { ascending: true });
    if (!messagesData) { setConversations([]); return; }

    const convs: Conversation[] = projectsData.map(p => {
      const msgs = (messagesData as ProjectMsg[]).filter(m => m.project_id === Number(p.id));
      return {
        project: p,
        messages: msgs,
        unread: msgs.filter(m => !m.read && m.sender_name !== userName).length,
        lastMessage: msgs[msgs.length - 1],
      };
    });

    const sorted = convs.filter(c => c.messages.length > 0).sort((a, b) =>
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );

    setConversations(prev => {
      const emptyConvs = convs.filter(c => c.messages.length === 0);
      return [...sorted, ...emptyConvs];
    });

    if (sorted.length > 0 && (!activeProjectId || !projectIds.includes(activeProjectId))) {
      setActiveProjectId(sorted[0].project.id);
    }
  }

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeProjectId, conversations]);

  async function handleSend() {
    if (!newMessage.trim() || !activeProjectId || sending) return;
    setSending(true);
    const msg = { project_id: Number(activeProjectId), sender_id: userId, sender_name: userName, content: newMessage.trim(), read: false };
    const { data } = await supabase.from('project_messages').insert(msg).select().single();
    setNewMessage('');
    if (data) {
      setConversations(prev => prev.map(c => {
        if (c.project.id === activeProjectId) return { ...c, messages: [...c.messages, data as ProjectMsg], lastMessage: data as ProjectMsg };
        return c;
      }));
    }
    setSending(false);
  }

  async function markAsRead(projectId: string) {
    const { data: unreadMsgs } = await supabase.from('project_messages').select('id').eq('project_id', projectId).eq('read', false);
    if (!unreadMsgs || unreadMsgs.length === 0) return;
    const ids = unreadMsgs.map(m => m.id);
    await supabase.from('project_messages').update({ read: true }).in('id', ids);
    setConversations(prev => prev.map(c => c.project.id === projectId ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c));
  }

  function handleSelectProject(projectId: string) { setActiveProjectId(projectId); markAsRead(projectId); }

  const activeConv = conversations.find(c => c.project.id === activeProjectId);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const filteredConvs = searchTerm ? conversations.filter(c => c.project.name.toLowerCase().includes(searchTerm.toLowerCase())) : conversations;

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
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Messages</h1>
            <p className="text-slate-400 mt-1">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''} across ${conversations.filter(c => c.messages.length > 0).length} conversation${conversations.filter(c => c.messages.length > 0).length > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </motion.div>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden flex h-full">
          <div className="w-80 lg:w-96 border-r border-[rgba(255,255,255,0.08)] flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4]/30 transition-all" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No conversations yet</p>
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <button key={conv.project.id} onClick={() => handleSelectProject(conv.project.id)}
                    className={`w-full text-left p-4 transition-colors cursor-pointer border-b border-[rgba(255,255,255,0.04)] ${
                      activeProjectId === conv.project.id ? 'bg-[#06B6D4]/5 border-l-2 border-l-[#06B6D4]' : 'hover:bg-white/5 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${conv.unread > 0 ? 'bg-[#06B6D4]/10' : 'bg-white/5'}`}>
                          <FolderKanban className={`w-4 h-4 ${conv.unread > 0 ? 'text-[#06B6D4]' : 'text-slate-400'}`} />
                        </div>
                        <span className="font-medium text-sm text-white truncate">{conv.project.name}</span>
                      </div>
                      {conv.messages.length > 0 && (
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                          {(() => {
                            const d = new Date(conv.lastMessage.created_at);
                            const now = new Date();
                            const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays === 0) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                            if (diffDays === 1) return 'Yesterday';
                            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate ml-10">
                        {conv.messages.length > 0 ? conv.lastMessage.content.slice(0, 60) + (conv.lastMessage.content.length > 60 ? '...' : '') : 'No messages yet'}
                      </p>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 bg-[#06B6D4] text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-2 flex-shrink-0">{conv.unread}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {activeConv ? (
              <>
                <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#06B6D4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-white truncate">{activeConv.project.name}</h3>
                    <p className="text-xs text-slate-400">{activeConv.messages.length} message{activeConv.messages.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                  {activeConv.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-white font-medium mb-1">Start the conversation</p>
                        <p className="text-sm text-slate-400">Send a message below to get started</p>
                      </div>
                    </div>
                  ) : (
                    activeConv.messages.map((msg, i) => {
                      const isMine = msg.sender_name === userName;
                      const showSender = i === 0 || activeConv.messages[i - 1].sender_name !== msg.sender_name;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isMine ? 'order-1' : ''}`}>
                            {showSender && <p className={`text-xs font-medium mb-1 px-1 ${isMine ? 'text-right text-[#06B6D4]' : 'text-slate-400'}`}>{isMine ? 'You' : msg.sender_name}</p>}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-[#06B6D4] text-white rounded-br-md' : 'bg-white/5 text-slate-200 rounded-bl-md'}`}>{msg.content}</div>
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'justify-end' : ''}`}>
                              <span className="text-[10px] text-slate-500">{new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMine && <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-[#06B6D4]' : 'text-slate-500'}`} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#06B6D4] hover:bg-[#06B6D4]/5 transition-colors cursor-pointer flex-shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4]/30 transition-all" />
                    <button onClick={handleSend} disabled={!newMessage.trim() || sending}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#06B6D4] text-white hover:bg-[#0891B2] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0">
                      {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="text-white font-medium mb-1">Select a conversation</p>
                  <p className="text-sm text-slate-400">Choose a project to view its messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}