'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AdminShell from '@/components/admin/AdminShell';
import { getSessionSafe } from '@/lib/supabase';

import {
  Activity,
  AlertTriangle,
  Bot,
  Bug,
  CheckCircle2,
  Clock3,
  GitBranch,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface ReleaseGate {
  id: string;
  checkType: string;
  status: string;
  blocking: boolean;
  safeSummary: string;
}

interface ReleaseCandidate {
  releaseId: string;
  releaseName: string;
  releaseVersion: string;
  environment: string;
  buildReference: string;
  gitSha: string;
  applicationBranch?: string | null;
  status: string;
  readinessScore: number;
  aiRecommendation: string;
  aiRecommendationSummary: string;
  criticalBugCount: number;
  highBugCount: number;
  mediumBugCount: number;
  lowBugCount: number;
  blockingIssues: number;
  warningCount: number;
  requiredRetests: number;
  latestDecision?: string | null;
  testRunId?: string | null;
  updatedAt?: string | null;
  gateChecks?: ReleaseGate[];
}

type FilterId =
  | 'all'
  | 'blocked'
  | 'ready'
  | 'retest';

function normaliseReleasePayload(
  payload: unknown,
): ReleaseCandidate[] {
  if (Array.isArray(payload)) {
    return payload as ReleaseCandidate[];
  }

  if (
    payload &&
    typeof payload === 'object'
  ) {
    const record =
      payload as Record<string, unknown>;

    if (Array.isArray(record.releases)) {
      return record.releases as ReleaseCandidate[];
    }

    if (
      record.data &&
      typeof record.data === 'object'
    ) {
      const data =
        record.data as Record<string, unknown>;

      if (Array.isArray(data.releases)) {
        return data.releases as ReleaseCandidate[];
      }
    }
  }

  return [];
}

function formatStatus(
  value: string,
): string {
  return value
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function statusClasses(
  status: string,
): string {
  if (
    [
      'ready_for_approval',
      'approved_for_release',
      'released',
    ].includes(status)
  ) {
    return (
      'text-emerald-400 ' +
      'bg-emerald-500/10 ' +
      'border-emerald-500/20'
    );
  }

  if (
    [
      'review_required',
      'ready_with_warnings',
    ].includes(status)
  ) {
    return (
      'text-amber-400 ' +
      'bg-amber-500/10 ' +
      'border-amber-500/20'
    );
  }

  if (
    [
      'not_ready',
      'release_rejected',
    ].includes(status)
  ) {
    return (
      'text-red-400 ' +
      'bg-red-500/10 ' +
      'border-red-500/20'
    );
  }

  return (
    'text-slate-300 ' +
    'bg-slate-500/10 ' +
    'border-slate-500/20'
  );
}

export default function AdminUatAgentPage() {
  const [
    releases,
    setReleases,
  ] = useState<ReleaseCandidate[]>([]);

  const [
    selectedRelease,
    setSelectedRelease,
  ] = useState<ReleaseCandidate | null>(
    null,
  );

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<FilterId>('all');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<Date | null>(null);

  const loadReleases =
    useCallback(
      async (
        manualRefresh = false,
      ) => {
        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const session =
            await getSessionSafe();

          if (!session?.access_token) {
            throw new Error(
              'Your administrator session has expired. Sign in again.',
            );
          }

          const response =
            await fetch(
              `/api/uat-agent/releases?timestamp=${Date.now()}`,
              {
                method: 'GET',
                cache: 'no-store',

                headers: {
                  Accept:
                    'application/json',

                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              },
            );

          const responseText =
            await response.text();

          let payload: unknown = null;

          if (responseText) {
            try {
              payload =
                JSON.parse(
                  responseText,
                );
            } catch {
              payload = null;
            }
          }

          if (!response.ok) {
            const responseError =
              payload &&
              typeof payload === 'object' &&
              'error' in payload
                ? (
                    payload as {
                      error?: {
                        message?: string;
                      };
                    }
                  ).error?.message
                : null;

            throw new Error(
              responseError ||
                `The AI UAT Agent returned HTTP ${response.status}.`,
            );
          }

          const candidates =
            normaliseReleasePayload(
              payload,
            );

          setReleases(candidates);
          setLastUpdated(
            new Date(),
          );

          setSelectedRelease(
            (current) => {
              if (!current) {
                return null;
              }

              return (
                candidates.find(
                  (candidate) =>
                    candidate.releaseId ===
                    current.releaseId,
                ) ?? null
              );
            },
          );
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Release information could not be loaded.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadReleases();
  }, [loadReleases]);

  const totals =
    useMemo(
      () => ({
        total:
          releases.length,

        blocked:
          releases.filter(
            (release) =>
              Number(
                release.blockingIssues ??
                  0,
              ) > 0,
          ).length,

        ready:
          releases.filter(
            (release) =>
              [
                'ready_for_approval',
                'approved_for_release',
                'released',
              ].includes(
                release.status,
              ),
          ).length,

        retests:
          releases.reduce(
            (
              total,
              release,
            ) =>
              total +
              Number(
                release.requiredRetests ??
                  0,
              ),
            0,
          ),
      }),
      [releases],
    );

  const filteredReleases =
    useMemo(
      () => {
        if (
          activeFilter ===
          'blocked'
        ) {
          return releases.filter(
            (release) =>
              Number(
                release.blockingIssues ??
                  0,
              ) > 0,
          );
        }

        if (
          activeFilter ===
          'ready'
        ) {
          return releases.filter(
            (release) =>
              [
                'ready_for_approval',
                'approved_for_release',
                'released',
              ].includes(
                release.status,
              ),
          );
        }

        if (
          activeFilter ===
          'retest'
        ) {
          return releases.filter(
            (release) =>
              Number(
                release.requiredRetests ??
                  0,
              ) > 0,
          );
        }

        return releases;
      },
      [
        activeFilter,
        releases,
      ],
    );

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#06B6D4]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                AI UAT Agent
              </h1>

              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Automated testing,
                AI-assisted review,
                release gates and protected
                human approval.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs text-slate-500">
              {lastUpdated
                ? `Updated ${formatDate(
                    lastUpdated.toISOString(),
                  )}`
                : 'Waiting for live release data'}
            </span>

            <button
              type="button"
              onClick={() =>
                loadReleases(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            {
              id: 'all' as const,
              label:
                'Release Candidates',
              value: totals.total,
              icon: Activity,
              className:
                'text-[#06B6D4] bg-[#06B6D4]/10',
            },
            {
              id: 'blocked' as const,
              label: 'Blocked',
              value: totals.blocked,
              icon: XCircle,
              className:
                'text-red-400 bg-red-500/10',
            },
            {
              id: 'ready' as const,
              label: 'Ready',
              value: totals.ready,
              icon: CheckCircle2,
              className:
                'text-emerald-400 bg-emerald-500/10',
            },
            {
              id: 'retest' as const,
              label:
                'Retests Required',
              value: totals.retests,
              icon: RotateCcw,
              className:
                'text-amber-400 bg-amber-500/10',
            },
          ].map((metric) => {
            const Icon =
              metric.icon;

            return (
              <button
                key={metric.id}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    metric.id,
                  )
                }
                className={`text-left bg-[#1E293B] border rounded-2xl p-5 transition-all cursor-pointer ${
                  activeFilter ===
                  metric.id
                    ? 'border-[#06B6D4]/40 ring-1 ring-[#06B6D4]/20'
                    : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      {metric.label}
                    </p>

                    <p className="text-3xl font-bold text-white mt-2">
                      {metric.value}
                    </p>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.className}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Release Governance
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Live information from the local
                UAT release engine.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Administrator protected
            </div>
          </div>

          {loading && (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="p-8">
              <div className="max-w-2xl mx-auto rounded-xl bg-red-500/10 border border-red-500/20 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />

                  <div>
                    <p className="text-sm font-semibold text-red-300">
                      Live release data is unavailable
                    </p>

                    <p className="text-sm text-red-200/70 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            filteredReleases.length === 0 && (
              <div className="text-center py-16 px-6">
                <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />

                <p className="text-slate-300 font-medium">
                  No matching release candidates
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Change the selected filter
                  or create a new release
                  candidate.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredReleases.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Release
                      </th>

                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>

                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Score
                      </th>

                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Bugs
                      </th>

                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Gates
                      </th>

                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Build
                      </th>

                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReleases.map(
                      (release) => {
                        const bugTotal =
                          Number(
                            release.criticalBugCount ??
                              0,
                          ) +
                          Number(
                            release.highBugCount ??
                              0,
                          ) +
                          Number(
                            release.mediumBugCount ??
                              0,
                          ) +
                          Number(
                            release.lowBugCount ??
                              0,
                          );

                        return (
                          <tr
                            key={
                              release.releaseId
                            }
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-white">
                                {
                                  release.releaseName
                                }
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {
                                  release.releaseVersion
                                }
                                {' · '}
                                {
                                  release.environment
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-medium ${statusClasses(
                                  release.status,
                                )}`}
                              >
                                {formatStatus(
                                  release.status,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span
                                className={`text-lg font-bold ${
                                  Number(
                                    release.readinessScore ??
                                      0,
                                  ) >= 80
                                    ? 'text-emerald-400'
                                    : Number(
                                          release.readinessScore ??
                                            0,
                                        ) >=
                                        60
                                      ? 'text-amber-400'
                                      : 'text-red-400'
                                }`}
                              >
                                {Number(
                                  release.readinessScore ??
                                    0,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <div className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                                <Bug className="w-4 h-4 text-red-400" />
                                {bugTotal}
                              </div>

                              {Number(
                                release.highBugCount ??
                                  0,
                              ) > 0 && (
                                <p className="text-xs text-red-400 mt-1">
                                  {
                                    release.highBugCount
                                  }{' '}
                                  high
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-center">
                              <p className="text-sm font-semibold text-red-400">
                                {Number(
                                  release.blockingIssues ??
                                    0,
                                )}{' '}
                                blocking
                              </p>

                              <p className="text-xs text-amber-400 mt-1">
                                {Number(
                                  release.warningCount ??
                                    0,
                                )}{' '}
                                warnings
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <GitBranch className="w-3.5 h-3.5" />

                                <span className="font-mono">
                                  {release.gitSha
                                    ? release.gitSha.slice(
                                        0,
                                        8,
                                      )
                                    : 'No SHA'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 font-mono mt-1 max-w-[220px] truncate">
                                {
                                  release.buildReference
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedRelease(
                                    release,
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-white/5 border border-[rgba(255,255,255,0.06)] text-xs text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4]/20 cursor-pointer"
                              >
                                View gates
                              </button>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        <div className="mt-6 rounded-2xl bg-[#1E293B] border border-[rgba(255,255,255,0.08)] p-5">
          <div className="flex items-start gap-3">
            <Clock3 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

            <div>
              <p className="text-sm font-semibold text-white">
                Read-only integration
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Release decisions remain disabled
                until the approved application has
                passed its own integration retest.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedRelease && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-[rgba(255,255,255,0.1)] shadow-2xl">
            <div className="sticky top-0 bg-[#0F172A] px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {
                    selectedRelease.releaseName
                  }
                </h2>

                <p className="text-xs text-slate-500 font-mono mt-1">
                  {
                    selectedRelease.releaseId
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRelease(
                    null,
                  )
                }
                className="w-9 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                aria-label="Close release details"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-4">
                  <p className="text-xs text-slate-500">
                    Readiness
                  </p>

                  <p className="text-2xl font-bold text-white mt-1">
                    {Number(
                      selectedRelease.readinessScore ??
                        0,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-4">
                  <p className="text-xs text-slate-500">
                    Blocking gates
                  </p>

                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {Number(
                      selectedRelease.blockingIssues ??
                        0,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-4">
                  <p className="text-xs text-slate-500">
                    Retests
                  </p>

                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {Number(
                      selectedRelease.requiredRetests ??
                        0,
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  AI assessment
                </h3>

                <div className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-4">
                  <p className="text-xs font-semibold text-[#06B6D4] uppercase">
                    {formatStatus(
                      selectedRelease.aiRecommendation ||
                        'not_available',
                    )}
                  </p>

                  <p className="text-sm text-slate-300 leading-6 mt-2">
                    {selectedRelease.aiRecommendationSummary ||
                      'No AI recommendation summary was returned.'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Release gates
                </h3>

                <div className="space-y-2">
                  {(selectedRelease.gateChecks ??
                    []).map(
                    (gate) => (
                      <div
                        key={gate.id}
                        className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {formatStatus(
                                gate.checkType,
                              )}
                            </p>

                            <p className="text-xs text-slate-400 leading-5 mt-1">
                              {
                                gate.safeSummary
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {gate.blocking && (
                              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-semibold uppercase">
                                Blocking
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-semibold uppercase">
                              {formatStatus(
                                gate.status,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}

                  {(selectedRelease.gateChecks ??
                    []).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No release gate details
                      were returned.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
