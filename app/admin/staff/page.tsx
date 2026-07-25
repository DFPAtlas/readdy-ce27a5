'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStaffDirectory, useInvitations, useStaffTeams, usePermissionSets, useTempAccess, useAccessRequests, useAccessReviews, useApprovalAuthority, useDelegations, useServiceAccounts, useSecurityEvents, useDepartments } from '@/hooks/useStaffData';
import StaffOverviewCards from '@/components/admin/staff/StaffOverviewCards';
import { STAFF_STATUS_CONFIG, INVITATION_STATUS_CONFIG, TEMP_ACCESS_STATUS_CONFIG, ACCESS_REQUEST_STATUS_CONFIG, REVIEW_STATUS_CONFIG, DELEGATION_STATUS_CONFIG, SERVICE_ACCOUNT_STATUS_CONFIG, MFA_STATE_CONFIG, IDENTITY_TYPES, GLOBAL_ROLES, OFFBOARDING_CHECKLIST_ITEMS, APPROVAL_AUTHORITY_TYPES } from '@/lib/staff-definitions';

const TABS = [
  'Overview', 'Directory', 'Invitations', 'Teams', 'Roles & Permissions',
  'Access Requests', 'Reviews', 'Temp Access', 'Delegations',
  'Service Accounts', 'Security Events', 'Settings',
];

export default function StaffHub() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');

  const { staff, loading: staffLoading } = useStaffDirectory(search || undefined);
  const { invitations, loading: invLoading } = useInvitations();
  const { teams, memberships, loading: teamLoading } = useStaffTeams();
  const { departments, loading: deptLoading } = useDepartments();
  const { sets, assignments, loading: permLoading } = usePermissionSets();
  const { grants, loading: grantLoading } = useTempAccess();
  const { requests, loading: reqLoading } = useAccessRequests();
  const { reviews, loading: reviewLoading } = useAccessReviews();
  const { authorities, loading: authLoading } = useApprovalAuthority();
  const { delegations, loading: delLoading } = useDelegations();
  const { accounts, loading: acctLoading } = useServiceAccounts();
  const { events, loading: evtLoading } = useSecurityEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Administration</h1>
          <p className="text-sm text-slate-400 mt-1">Identity, teams, roles, permissions and access security</p>
        </div>
      </div>

      <StaffOverviewCards />

      <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-[#06B6D4] text-[#06B6D4]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Staff</h3>
            <div className="space-y-2">
              {staffLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : staff.length === 0 ? (
                <p className="text-sm text-slate-500">No staff records found.</p>
              ) : (
                staff.slice(0, 8).map((s: any) => (
                  <Link
                    key={`${s.source}-${s.id}`}
                    href={`/admin/staff/${s.id}?source=${s.source}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#06B6D4]/10 flex items-center justify-center text-xs font-bold text-[#06B6D4]">
                      {(s.full_name || s.email || '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{s.full_name || s.email}</p>
                      <p className="text-xs text-slate-500 truncate">{s.role || 'No role'}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${(STAFF_STATUS_CONFIG as any)[s.status || 'Active']?.bg || 'bg-slate-500/10'} ${(STAFF_STATUS_CONFIG as any)[s.status || 'Active']?.color || 'text-slate-400'}`}>
                      {s.status || 'Active'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Invitations</h3>
            <div className="space-y-2">
              {invLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : invitations.length === 0 ? (
                <p className="text-sm text-slate-500">No invitations sent.</p>
              ) : (
                invitations.slice(0, 8).map((inv: any) => (
                  <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <i className="ri-mail-send-line text-blue-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{inv.email}</p>
                      <p className="text-xs text-slate-500">{inv.proposed_role || 'No role'}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${(INVITATION_STATUS_CONFIG as any)[inv.status]?.bg || 'bg-slate-500/10'} ${(INVITATION_STATUS_CONFIG as any)[inv.status]?.color || 'text-slate-400'}`}>
                      {inv.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Directory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm w-4 h-4 flex items-center justify-center"></i>
              <input
                type="text"
                placeholder="Search by name, email, reference or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4]/50"
              />
            </div>
            <Link
              href="/admin/staff?tab=Invitations"
              className="px-4 py-2 bg-[#06B6D4]/10 text-[#06B6D4] text-sm font-medium rounded-xl hover:bg-[#06B6D4]/20 transition-colors cursor-pointer whitespace-nowrap"
              onClick={() => setActiveTab('Invitations')}
            >
              Invite Staff
            </Link>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Staff</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Reference</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">MFA</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Last Login</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffLoading ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                  ) : staff.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No staff records found.</td></tr>
                  ) : (
                    staff.map((s: any) => {
                      const status = s.status || 'Active';
                      const mfa = s.mfa_state || 'Unknown';
                      const mfaCfg = MFA_STATE_CONFIG[mfa as keyof typeof MFA_STATE_CONFIG] || MFA_STATE_CONFIG.Unknown;
                      const statusCfg = (STAFF_STATUS_CONFIG as any)[status] || STAFF_STATUS_CONFIG.Active;
                      const identityType = s.identity_type || 'internal';
                      return (
                        <tr key={`${s.source}-${s.id}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#06B6D4]/10 flex items-center justify-center text-xs font-bold text-[#06B6D4]">
                                {(s.full_name || s.email || '??').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white text-sm">{s.full_name || s.email}</p>
                                <p className="text-xs text-slate-500">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs font-mono">{s.reference || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">{IDENTITY_TYPES[identityType as keyof typeof IDENTITY_TYPES]?.label || identityType}</span>
                          </td>
                          <td className="px-4 py-3 text-white text-sm">{s.role || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${mfaCfg.bg} ${mfaCfg.color}`}>{mfaCfg.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{s.last_login_at ? new Date(s.last_login_at).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/staff/${s.id}?source=${s.source}`}
                              className="text-xs text-[#06B6D4] hover:underline cursor-pointer"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Invitations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Staff Invitations</h3>
            <Link
              href="/admin/staff?tab=Roles+%26+Permissions"
              className="px-4 py-2 bg-[#06B6D4]/10 text-[#06B6D4] text-sm font-medium rounded-xl hover:bg-[#06B6D4]/20 transition-colors cursor-pointer whitespace-nowrap"
              onClick={() => setActiveTab('Roles & Permissions')}
            >
              New Invitation
            </Link>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Proposed Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Sent</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Expires</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invLoading ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                  ) : invitations.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No invitations yet. Staff management uses live data.</td></tr>
                  ) : (
                    invitations.map((inv: any) => (
                      <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">{inv.email}</td>
                        <td className="px-4 py-3 text-white">{inv.proposed_role || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${(INVITATION_STATUS_CONFIG as any)[inv.status]?.bg || 'bg-slate-500/10'} ${(INVITATION_STATUS_CONFIG as any)[inv.status]?.color || 'text-slate-400'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          {inv.status === 'Sent' && (
                            <button className="text-xs text-red-400 hover:underline cursor-pointer">Revoke</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Departments</h3>
            {deptLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : departments.length === 0 ? (
              <p className="text-sm text-slate-500">No departments defined. Create departments to organise teams.</p>
            ) : (
              <div className="space-y-2">
                {departments.map((d: any) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <i className="ri-building-line text-slate-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                    <div className="flex-1">
                      <p className="text-sm text-white">{d.name}</p>
                      {d.description && <p className="text-xs text-slate-500">{d.description}</p>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Teams</h3>
            {teamLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : teams.length === 0 ? (
              <p className="text-sm text-slate-500">No teams defined. Teams organise staff within departments.</p>
            ) : (
              <div className="space-y-2">
                {teams.map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <i className="ri-group-line text-slate-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                    <div className="flex-1">
                      <p className="text-sm text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.staff_departments?.name || 'No department'}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Roles & Permissions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Global Roles</h3>
              <div className="space-y-2">
                {Object.entries(GLOBAL_ROLES).map(([key, role]) => (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className={`w-3 h-3 rounded-full ${role.isPrivileged ? 'bg-purple-400' : 'bg-slate-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{role.label}</p>
                      <p className="text-xs text-slate-500">{role.description}</p>
                    </div>
                    {role.isPrivileged && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Privileged</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Permission Sets</h3>
              {permLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : sets.length === 0 ? (
                <p className="text-sm text-slate-500">No permission sets defined. Create sets for common team access patterns.</p>
              ) : (
                <div className="space-y-2">
                  {sets.map((ps: any) => (
                    <div key={ps.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <i className="ri-key-2-line text-slate-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                      <div className="flex-1">
                        <p className="text-sm text-white">{ps.name} <span className="text-xs text-slate-500">v{ps.version}</span></p>
                        <p className="text-xs text-slate-500">{ps.description || `${(ps.permissions || []).length} permissions`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Access Requests' && (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Requester</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Requested</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reqLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No access requests. Self-service access requests appear here.</td></tr>
                ) : (
                  requests.map((r: any) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-xs font-mono">{r.requester_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{(r.requested_permission_keys || []).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{r.business_reason}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${(ACCESS_REQUEST_STATUS_CONFIG as any)[r.status]?.bg || 'bg-slate-500/10'} ${(ACCESS_REQUEST_STATUS_CONFIG as any)[r.status]?.color || 'text-slate-400'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {r.status === 'Requested' && (
                          <>
                            <button className="text-xs text-emerald-400 hover:underline cursor-pointer">Approve</button>
                            <button className="text-xs text-red-400 hover:underline cursor-pointer">Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Staff</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Scope</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Decision</th>
                </tr>
              </thead>
              <tbody>
                {reviewLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No access reviews scheduled.</td></tr>
                ) : (
                  reviews.map((r: any) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-xs font-mono">{r.staff_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{r.scope || 'Full'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{r.due_date || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${(REVIEW_STATUS_CONFIG as any)[r.status]?.bg || 'bg-slate-500/10'} ${(REVIEW_STATUS_CONFIG as any)[r.status]?.color || 'text-slate-400'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{r.decision || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Temp Access' && (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Staff</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Permission</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Scope</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {grantLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : grants.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No temporary access grants.</td></tr>
                ) : (
                  grants.map((g: any) => (
                    <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-xs font-mono">{g.staff_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs text-white">{g.permission_key}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{g.scope}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{g.expires_at ? new Date(g.expires_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${(TEMP_ACCESS_STATUS_CONFIG as any)[g.status]?.bg || 'bg-slate-500/10'} ${(TEMP_ACCESS_STATUS_CONFIG as any)[g.status]?.color || 'text-slate-400'}`}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Delegations' && (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Delegator</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Delegate</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Scope</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {delLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : delegations.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No active delegations.</td></tr>
                ) : (
                  delegations.map((d: any) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-xs font-mono">{d.delegator_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-white text-xs font-mono">{d.delegate_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{d.scope}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{d.expires_at ? new Date(d.expires_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${(DELEGATION_STATUS_CONFIG as any)[d.status]?.bg || 'bg-slate-500/10'} ${(DELEGATION_STATUS_CONFIG as any)[d.status]?.color || 'text-slate-400'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Service Accounts' && (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Purpose</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Environment</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Rotation Due</th>
                </tr>
              </thead>
              <tbody>
                {acctLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No service accounts defined.</td></tr>
                ) : (
                  accounts.map((a: any) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white">{a.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[250px] truncate">{a.purpose}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{a.environment}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${(SERVICE_ACCOUNT_STATUS_CONFIG as any)[a.status]?.bg || 'bg-slate-500/10'} ${(SERVICE_ACCOUNT_STATUS_CONFIG as any)[a.status]?.color || 'text-slate-400'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{a.rotation_due || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Security Events' && (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Staff</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody>
                {evtLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No security events recorded.</td></tr>
                ) : (
                  events.map((e: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-xs">{e.event_type || e.action || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{e.staff_id ? e.staff_id.slice(0, 8) : (e.actor_id ? e.actor_id.slice(0, 8) : '—')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.severity === 'critical' ? 'bg-red-500/10 text-red-400' : e.severity === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          {e.severity || 'info'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{e.source || e.source_table || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{e.created_at ? new Date(e.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Approval Authority Types</h3>
            <div className="space-y-2">
              {APPROVAL_AUTHORITY_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <i className="ri-checkbox-circle-line text-slate-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                  <div className="flex-1">
                    <p className="text-sm text-white capitalize">{type.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs text-slate-500">{authorities.filter((a: any) => a.authority_type === type).length} assigned</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Offboarding Checklist</h3>
            <div className="space-y-2">
              {OFFBOARDING_CHECKLIST_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <i className="ri-checkbox-blank-circle-line text-slate-500 text-sm w-4 h-4 flex items-center justify-center"></i>
                  <p className="text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}