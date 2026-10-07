import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Award,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const API = 'https://easytofindedu.onrender.com/api/v1';
const ADMIN_TOKEN_KEY = 'admin_token';

function getToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

async function adminGet<T = any>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '', Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return (await res.json()).data as T;
}

async function adminSend<T = any>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return (await res.json()).data as T;
}

interface Scholarship {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  scholarshipType: string;
  category: string;
  status: 'active' | 'inactive' | 'closed' | 'expired' | 'draft';
  computedStatus: 'active' | 'upcoming' | 'closing_soon' | 'closed' | 'expired' | 'unknown';
  isFeatured: boolean;
  amount: { min: number; max: number; currency: string; frequency: string; note?: string };
  amountLabel: string;
  deadline: { applicationEndDate: string | null; typicalWindow: string; isRecurring: boolean };
  deadlineLabel: string;
  source: { sourceName: string; sourceUrl: string; officialApplicationUrl: string; sourceType: string; lastVerifiedAt: string };
  createdAt: string;
  updatedAt: string;
}

interface ScholarshipPage {
  items: Scholarship[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ScholarshipStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
  expired: number;
  featured: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: 'ACTIVE', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  inactive: { label: 'INACTIVE', cls: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  closed: { label: 'CLOSED', cls: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  expired: { label: 'EXPIRED', cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
  draft: { label: 'DRAFT', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ComputedPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    upcoming: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    closing_soon: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    closed: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    expired: 'bg-red-500/10 text-red-300 border-red-500/20',
    unknown: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${map[status] || map.unknown}`}>
      {(status || 'unknown').replace('_', ' ')}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export function ScholarshipsAdminView() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<Scholarship[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [stats, setStats] = useState<ScholarshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState<Scholarship | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (query) params.set('query', query);
      if (status) params.set('status', status);
      const [list, statsData] = await Promise.all([
        adminGet<ScholarshipPage>(`/admin/career/scholarships?${params.toString()}`),
        adminGet<ScholarshipStats>('/admin/career/scholarships/stats'),
      ]);
      setItems(list.items || []);
      setPagination(list.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      setStats(statsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load scholarships');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, query, status]);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { setRefreshing(true); load(); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  const doAction = async (id: string, kind: 'verify' | 'feature' | 'close' | 'activate' | 'expire') => {
    setActionBusy(`${kind}-${id}`);
    try {
      if (kind === 'verify') {
        await adminSend(`/admin/career/scholarships/${id}/verify`, 'PATCH');
      } else if (kind === 'feature') {
        await adminSend(`/admin/career/scholarships/${id}/feature`, 'PATCH');
      } else if (kind === 'close') {
        await adminSend(`/admin/career/scholarships/${id}/status`, 'PATCH', { status: 'closed' });
      } else if (kind === 'activate') {
        await adminSend(`/admin/career/scholarships/${id}/status`, 'PATCH', { status: 'active' });
      } else if (kind === 'expire') {
        await adminSend(`/admin/career/scholarships/${id}/status`, 'PATCH', { status: 'expired' });
      }
      await load();
      if (openDetail && openDetail._id === id) {
        // Refresh detail panel
        const fresh = await adminGet<Scholarship>(`/admin/career/scholarships/${id}`);
        setOpenDetail(fresh);
      }
    } catch (err: any) {
      setError(err?.message || `Action ${kind} failed`);
    } finally {
      setActionBusy(null);
    }
  };

  const sortedItems = useMemo(() => items, [items]);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-cream-100/40 text-sm">Loading scholarships…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {error && (
        <div className="border-l-2 border-wine bg-wine/10 px-5 py-3 text-sm text-cream-100/80">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-xs underline">dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="overline text-gold-400 mb-2">Career Guidance</p>
          <h1 className="font-display text-d4 text-cream-100">Scholarships</h1>
          <p className="text-cream-100/50 text-sm mt-1 max-w-xl">
            Manage scholarship listings surfaced in the public Scholarship Finder. Always keep source URLs and deadlines accurate.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gold-500/40 text-gold-400 text-[11px] uppercase tracking-wide2 hover:bg-gold-500/10 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile label="Total" value={stats.total} icon={Award} />
          <StatTile label="Active" value={stats.active} icon={CheckCircle2} />
          <StatTile label="Featured" value={stats.featured} icon={ShieldCheck} />
          <StatTile label="Closed" value={stats.closed} />
          <StatTile label="Expired" value={stats.expired} />
          <StatTile label="Draft" value={stats.draft} />
        </div>
      )}

      {/* Filters */}
      <div className="border border-night-700 bg-night-900 p-4 flex flex-col lg:flex-row gap-3 min-w-0">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or provider…"
              className="w-full bg-night-800 border border-night-600 pl-9 pr-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 border border-gold-500/50 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors flex-shrink-0"
          >
            Search
          </button>
        </form>
        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0 flex-shrink-0">
          {['', 'active', 'inactive', 'closed', 'expired', 'draft'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`flex-shrink-0 px-3 py-2 text-[10px] uppercase tracking-wide2 transition-colors whitespace-nowrap ${
                status === s
                  ? 'bg-gold-500 text-night-900'
                  : 'border border-night-600 text-cream-100/60 hover:border-gold-500 hover:text-gold-400'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-night-700 bg-night-900 overflow-x-auto">
        <table className="w-full text-sm min-w-[840px]">
          <thead>
            <tr className="border-b border-night-700 text-left text-[10px] uppercase tracking-wide2 text-cream-100/40">
              <th className="px-4 py-3 font-medium">Scholarship</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-cream-100/40">
                  No scholarships match the current filters.
                </td>
              </tr>
            ) : (
              sortedItems.map((s) => (
                <tr key={s._id} className="border-b border-night-800 hover:bg-night-800/40">
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="font-medium text-cream-100 line-clamp-1">{s.name}</div>
                    <div className="text-[10px] text-cream-100/30 mt-0.5 flex items-center gap-1.5">
                      <span className="uppercase">{s.scholarshipType.replace(/_/g, ' ')}</span>
                      {s.isFeatured && (
                        <span className="px-1.5 py-px rounded bg-gold-500/15 text-gold-300 border border-gold-500/30 text-[9px]">FEATURED</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream-100/70 text-xs max-w-[180px]">
                    <div className="line-clamp-1">{s.source?.sourceName}</div>
                    <div className="text-[10px] text-cream-100/30 mt-0.5 uppercase">{s.source?.sourceType}</div>
                  </td>
                  <td className="px-4 py-3 text-cream-100/80 text-xs whitespace-nowrap">
                    {s.amountLabel}
                  </td>
                  <td className="px-4 py-3 text-cream-100/70 text-xs whitespace-nowrap">
                    {s.deadlineLabel}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusPill status={s.status} />
                      <ComputedPill status={s.computedStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={s.source?.officialApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-400/80 hover:text-gold-300 inline-flex items-center gap-1 text-xs"
                    >
                      Apply <ExternalLink size={11} />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-cream-100/50 text-[11px] whitespace-nowrap">
                    {formatDate(s.source?.lastVerifiedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1 flex-wrap justify-end">
                      <button
                        onClick={() => setOpenDetail(s)}
                        className="px-2 py-1 text-[10px] uppercase tracking-wider text-cream-100/60 hover:text-gold-400 border border-night-600 hover:border-gold-500/40"
                      >
                        <Eye size={11} className="inline -mt-0.5 mr-0.5" />
                        View
                      </button>
                      <button
                        onClick={() => doAction(s._id, 'feature')}
                        disabled={actionBusy === `feature-${s._id}`}
                        className="px-2 py-1 text-[10px] uppercase tracking-wider text-cream-100/60 hover:text-gold-400 border border-night-600 hover:border-gold-500/40"
                      >
                        {s.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => doAction(s._id, 'verify')}
                        disabled={actionBusy === `verify-${s._id}`}
                        className="px-2 py-1 text-[10px] uppercase tracking-wider text-cream-100/60 hover:text-emerald-300 border border-night-600 hover:border-emerald-500/40"
                      >
                        Verify
                      </button>
                      {s.status === 'closed' || s.status === 'expired' ? (
                        <button
                          onClick={() => doAction(s._id, 'activate')}
                          disabled={actionBusy === `activate-${s._id}`}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider text-cream-100/60 hover:text-emerald-300 border border-night-600 hover:border-emerald-500/40"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => doAction(s._id, 'close')}
                          disabled={actionBusy === `close-${s._id}`}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider text-cream-100/60 hover:text-red-300 border border-night-600 hover:border-red-500/40"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 border border-night-700 text-cream-100/70 text-xs hover:border-gold-500/40 disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="px-4 py-1.5 text-cream-100/60 text-xs">
            Page {page} of {pagination.totalPages} • {pagination.total} total
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="flex items-center gap-1 px-3 py-1.5 border border-night-700 text-cream-100/70 text-xs hover:border-gold-500/40 disabled:opacity-30"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Detail drawer */}
      {openDetail && (
        <ScholarshipDetailDrawer
          scholarship={openDetail}
          onClose={() => setOpenDetail(null)}
          onAction={doAction}
          actionBusy={actionBusy}
        />
      )}
    </div>
  );
}

function StatTile({ label, value, icon: Icon }: { label: string; value: number; icon?: any }) {
  return (
    <div className="border border-night-700 bg-night-900 p-4 flex items-center gap-3">
      {Icon && <Icon size={18} className="text-gold-400" />}
      <div>
        <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40">{label}</p>
        <p className="font-display text-2xl text-cream-100">{value}</p>
      </div>
    </div>
  );
}

function ScholarshipDetailDrawer({
  scholarship: s,
  onClose,
  onAction,
  actionBusy,
}: {
  scholarship: Scholarship;
  onClose: () => void;
  onAction: (id: string, kind: 'verify' | 'feature' | 'close' | 'activate' | 'expire') => void;
  actionBusy: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-night-950/70 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-night-900 border-l border-night-700 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-night-900 border-b border-night-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="overline text-gold-400">Scholarship</p>
            <h2 className="font-display text-lg text-cream-100 mt-1 line-clamp-1">{s.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-cream-100/60 hover:text-cream-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          <div className="flex gap-2 flex-wrap">
            <StatusPill status={s.status} />
            <ComputedPill status={s.computedStatus} />
            {s.isFeatured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border border-gold-500/30 text-gold-300 bg-gold-500/10">
                FEATURED
              </span>
            )}
          </div>

          {s.shortDescription && (
            <div>
              <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40 mb-1">Description</p>
              <p className="text-cream-100/80">{s.shortDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Provider" value={s.source?.sourceName} />
            <Field label="Source Type" value={s.source?.sourceType} />
            <Field label="Amount" value={s.amountLabel} />
            <Field label="Deadline" value={s.deadlineLabel} />
            <Field label="Type" value={s.scholarshipType?.replace(/_/g, ' ')} />
            <Field label="Category" value={s.category} />
            <Field label="Source URL" link={s.source?.sourceUrl} />
            <Field label="Apply URL" link={s.source?.officialApplicationUrl} />
            <Field label="Last Verified" value={formatDate(s.source?.lastVerifiedAt)} />
            <Field label="Created" value={formatDate(s.createdAt)} />
          </div>

          <div className="border-t border-night-700 pt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => onAction(s._id, 'verify')}
              disabled={actionBusy === `verify-${s._id}`}
              className="px-3 py-1.5 border border-emerald-500/40 text-emerald-300 text-[11px] uppercase tracking-wide2 hover:bg-emerald-500/10"
            >
              Mark verified
            </button>
            <button
              onClick={() => onAction(s._id, 'feature')}
              disabled={actionBusy === `feature-${s._id}`}
              className="px-3 py-1.5 border border-gold-500/40 text-gold-400 text-[11px] uppercase tracking-wide2 hover:bg-gold-500/10"
            >
              {s.isFeatured ? 'Unfeature' : 'Mark featured'}
            </button>
            {s.status === 'closed' || s.status === 'expired' ? (
              <button
                onClick={() => onAction(s._id, 'activate')}
                disabled={actionBusy === `activate-${s._id}`}
                className="px-3 py-1.5 border border-emerald-500/40 text-emerald-300 text-[11px] uppercase tracking-wide2 hover:bg-emerald-500/10"
              >
                Re-activate
              </button>
            ) : (
              <button
                onClick={() => onAction(s._id, 'close')}
                disabled={actionBusy === `close-${s._id}`}
                className="px-3 py-1.5 border border-red-500/40 text-red-300 text-[11px] uppercase tracking-wide2 hover:bg-red-500/10"
              >
                Mark closed
              </button>
            )}
            {s.status !== 'expired' && (
              <button
                onClick={() => onAction(s._id, 'expire')}
                disabled={actionBusy === `expire-${s._id}`}
                className="px-3 py-1.5 border border-red-500/40 text-red-300 text-[11px] uppercase tracking-wide2 hover:bg-red-500/10"
              >
                Mark expired
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, link }: { label: string; value?: string | null; link?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40 mb-1">{label}</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-400/80 hover:text-gold-300 text-xs inline-flex items-center gap-1 break-all"
        >
          {link.length > 60 ? link.slice(0, 60) + '…' : link}
          <ExternalLink size={11} />
        </a>
      ) : (
        <p className="text-cream-100/80 text-xs break-words">{value || '—'}</p>
      )}
    </div>
  );
}
