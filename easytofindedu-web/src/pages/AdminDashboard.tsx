import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Hotel,
  Users,
  GraduationCap,
  TrendingUp,
  RefreshCw,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Send,
  ShieldOff,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  History,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Spinner, SectionMark, EmptyNote, ErrorNote } from '../components/primitives';

/* ============================================================
 * Constants — single source of truth for backend endpoints
 * ============================================================ */

const API_BASE = 'https://easytofindedu.onrender.com/api/v1';

// NOTE: institute applications are mounted at /api/admin/* (no v1)
const APP_API_BASE = 'https://easytofindedu.onrender.com/api/admin';

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_PROFILE_KEY = 'admin_profile';

const TOTAL_STEPS = 14;

const STEP_LABELS = [
  'Institute Info',
  'Category',
  'Location & Contact',
  'Courses',
  'Batches & Schedule',
  'Learning Experience',
  'Facilities',
  'Faculty',
  'Fees & Scholarships',
  'Admission',
  'Career Outcomes',
  'Results',
  'Gallery',
  'Verification',
];

/* ============================================================
 * Types
 * ============================================================ */

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Hostel {
  _id: string;
  name: string;
  masked_name?: string;
  slug?: string;
  hostel_type: string;
  status: string;
  is_open: boolean;
  owner?: { _id: string; name: string; email: string; phone?: string };
  createdAt: string;
  updatedAt: string;
  address?: { city?: string; area?: string; line1?: string; state?: string; pincode?: string };
  views_count?: number;
  leads_count?: number;
  total_hostel_beds?: number;
  rooms?: Array<{ room_type: string; total_beds: number; monthly_rent: number }>;
  photos?: string[];
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt: string;
  is_verified?: boolean;
  hostels?: Array<{ name: string; status: string; address?: { city?: string }; hostel_type: string; photos?: string[] }>;
}

interface InstituteOwner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt: string;
  institutes?: Array<{ name: string; isApproved: boolean; logo?: string; location?: { city?: string } }>;
}

interface InstituteApplication {
  _id: string;
  owner?: { _id: string; name: string; email: string; phone?: string };
  status: string;
  verificationStatus: string;
  currentStep: number;
  completionPercentage: number;
  submittedAt?: string;
  lastSavedAt?: string;
  adminFeedback?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verificationHistory?: Array<{
    action: string;
    status: string;
    adminName?: string;
    reason?: string;
    timestamp: string;
  }>;
  step1InstituteInfo?: any;
  step2Category?: any;
  step3LocationContact?: any;
  step4Courses?: any;
  step5Batches?: any;
  step6LearningExperience?: any;
  step7Facilities?: any;
  step8Faculty?: any;
  step9Fees?: any;
  step10Admission?: any;
  step11Career?: any;
  step12Results?: any;
  step13Gallery?: any;
  step14Verification?: any;
}

/* ============================================================
 * Auth helpers
 * ============================================================ */

function getAdminToken(): string | null {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; }
}
function setAdminSession(token: string, profile: AdminProfile) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}
function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_PROFILE_KEY);
  } catch { /* ignore */ }
}
function getAdminProfile(): AdminProfile | null {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch { return null; }
}

/* ============================================================
 * API helpers — single point of API contact
 * ============================================================ */

async function adminApi(
  path: string,
  init: RequestInit = {},
  base: string = API_BASE,
): Promise<any> {
  const token = getAdminToken();
  const res = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (res.status === 401) {
    // Token expired or invalid — force re-login.
    clearAdminSession();
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

const get = (path: string, base?: string) => adminApi(path, { method: 'GET' }, base);
const patch = (path: string, body: any, base?: string) =>
  adminApi(path, { method: 'PATCH', body: JSON.stringify(body) }, base);

/* ============================================================
 * Main component
 * ============================================================ */

export function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [profile, setProfile] = useState<AdminProfile | null>(() => getAdminProfile());
  const [view, setView] = useState<ViewKey>('dashboard');
  const [authExpired, setAuthExpired] = useState(false);

  // Global auth-expired listener — any API call that throws "Session expired"
  // sets this flag and we bounce back to login.
  const requireLogin = useCallback((err: Error) => {
    if (err.message.includes('Session expired')) {
      clearAdminSession();
      setToken(null);
      setProfile(null);
      setAuthExpired(true);
    }
    throw err;
  }, []);

  if (!token || !profile) {
    return (
      <LoginScreen
        authExpired={authExpired}
        onLogin={(t, p) => {
          setAdminSession(t, p);
          setToken(t);
          setProfile(p);
          setAuthExpired(false);
        }}
      />
    );
  }

  return (
    <Shell
      profile={profile}
      view={view}
      setView={(v) => setView(v)}
      onLogout={() => {
        clearAdminSession();
        setToken(null);
        setProfile(null);
        navigate('/');
      }}
    >
      {view === 'dashboard' && <DashboardView onError={requireLogin} />}
      {view === 'institute-applications' && (
        <InstituteApplicationsView
          onOpen={(id) => setView({ kind: 'institute-review', id } as any)}
          onError={requireLogin}
        />
      )}
      {typeof view === 'object' && (view as any).kind === 'institute-review' && (
        <InstituteReviewView
          applicationId={(view as any).id as string}
          onBack={() => setView('institute-applications')}
          onError={requireLogin}
        />
      )}
      {view === 'hostel-approvals' && <HostelApprovalsView onError={requireLogin} />}
      {view === 'all-hostels' && <AllHostelsView onError={requireLogin} />}
      {view === 'hostel-owners' && <HostelOwnersView onError={requireLogin} />}
      {view === 'institute-owners' && <InstituteOwnersView onError={requireLogin} />}
      {view === 'students' && <StudentsView />}
      {view === 'analytics' && <AnalyticsView onError={requireLogin} />}
    </Shell>
  );
}

/* ============================================================
 * View key type
 * ============================================================ */

type ViewKey =
  | 'dashboard'
  | 'institute-applications'
  | { kind: 'institute-review'; id: string }
  | 'hostel-approvals'
  | 'all-hostels'
  | 'hostel-owners'
  | 'institute-owners'
  | 'students'
  | 'analytics';

/* ============================================================
 * Login Screen
 * ============================================================ */

function LoginScreen({
  authExpired,
  onLogin,
}: {
  authExpired: boolean;
  onLogin: (token: string, profile: AdminProfile) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await adminApi(
        '/admin/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
        API_BASE,
      );
      // Response shape: { success, message, data: { token, admin: { _id, name, email, role, ... } } }
      const token = data?.data?.token ?? data?.token;
      const admin = data?.data?.admin ?? data?.admin;
      if (!token || !admin) {
        throw new Error('Unexpected response from server');
      }
      onLogin(token, {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-night-950 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md border border-night-700 bg-night-900 p-10 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center border border-gold-500/40 mb-6">
            <ShieldOff className="h-6 w-6 text-gold-500" />
          </div>
          <p className="overline text-gold-400">EasyToFindEdu</p>
          <h1 className="mt-3 font-display text-d3 text-cream-100">Admin Portal</h1>
          <p className="mt-2 text-sm text-cream-100/50">Sign in with your admin account.</p>
        </div>

        {authExpired && (
          <div className="mb-6 border-l-2 border-wine bg-wine/10 px-5 py-3 text-sm text-cream-100/80">
            Your session expired. Please sign in again.
          </div>
        )}
        {error && (
          <div className="mb-6 border-l-2 border-wine bg-wine/10 px-5 py-3 text-sm text-cream-100/80">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-wide2 text-gold-400 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@easytofindedu.com"
              className="w-full border-0 border-b border-night-600 bg-transparent py-3 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wide2 text-gold-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-0 border-b border-night-600 bg-transparent py-3 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gold-500 py-4 text-[11px] uppercase tracking-wide2 text-night-900 transition-colors duration-300 hover:bg-gold-400 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ============================================================
 * Shell (sidebar + topbar + main)
 * ============================================================ */

function Shell({
  profile,
  view,
  setView,
  onLogout,
  children,
}: {
  profile: AdminProfile;
  view: ViewKey;
  setView: (v: ViewKey) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const navItems: Array<{ key: ViewKey; label: string; icon: any }> = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'institute-applications', label: 'Institute Applications', icon: Building2 },
    { key: 'hostel-approvals', label: 'Hostel Approvals', icon: ShieldOff },
    { key: 'all-hostels', label: 'All Hostels', icon: Hotel },
    { key: 'hostel-owners', label: 'Hostel Owners', icon: Users },
    { key: 'institute-owners', label: 'Institute Owners', icon: Users },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const activeKey: string = typeof view === 'string' ? view : (view as any).kind;

  return (
    <div className="bg-night-950 min-h-screen flex">
      <aside className="w-64 bg-night-900 border-r border-night-700 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-night-700">
          <p className="overline text-gold-400">EasyToFindEdu</p>
          <h1 className="mt-2 font-display text-xl text-cream-100">Admin Portal</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeKey === item.key || (item.key === 'institute-applications' && activeKey === 'institute-review');
            return (
              <button
                key={typeof item.key === 'string' ? item.key : 'institute-review'}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 ${
                  active
                    ? 'bg-gold-500 text-night-900 font-medium'
                    : 'text-cream-100/70 hover:bg-night-800 hover:text-cream-100'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-night-700">
          <div className="mb-3">
            <p className="text-xs text-cream-100 font-medium truncate">{profile.name}</p>
            <p className="text-[10px] text-cream-100/50 truncate">{profile.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cream-100/70 hover:text-cream-100 hover:bg-night-800 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-night-700 bg-night-900/60 backdrop-blur-sm sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <p className="overline text-gold-400">{getViewLabel(view)}</p>
              <p className="text-xs text-cream-100/40 mt-1">
                Signed in as {profile.name} · {profile.role}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}

function getViewLabel(view: ViewKey): string {
  if (typeof view === 'string') {
    return ({
      'dashboard': 'Overview',
      'institute-applications': 'Institute Applications',
      'hostel-approvals': 'Hostel Approvals',
      'all-hostels': 'All Hostels',
      'hostel-owners': 'Hostel Owners',
      'institute-owners': 'Institute Owners',
      'students': 'Students',
      'analytics': 'Analytics',
    } as Record<string, string>)[view] || 'Admin';
  }
  return 'Application Review';
}

/* ============================================================
 * Shared bits
 * ============================================================ */

function PageHeader({
  title,
  subtitle,
  onRefresh,
  refreshing,
  actions,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 pb-6 border-b border-night-700">
      <div>
        <h2 className="font-display text-d2 text-cream-100">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-cream-100/50 max-w-2xl">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 border border-night-600 px-4 py-2 text-[10px] uppercase tracking-wide2 text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const config: Record<string, { label: string; classes: string; icon: any }> = {
    submitted: { label: 'Submitted', classes: 'border-blue-400/40 bg-blue-400/5 text-blue-300', icon: FileText },
    pending: { label: 'Pending', classes: 'border-gold-500/40 bg-gold-500/5 text-gold-300', icon: Clock },
    approved: { label: 'Approved', classes: 'border-green-400/40 bg-green-400/5 text-green-300', icon: CheckCircle },
    verified: { label: 'Verified', classes: 'border-green-400/40 bg-green-400/5 text-green-300', icon: CheckCircle },
    rejected: { label: 'Rejected', classes: 'border-red-400/40 bg-red-400/5 text-red-300', icon: XCircle },
    changes_requested: { label: 'Changes Requested', classes: 'border-wine bg-wine/10 text-cream-100', icon: AlertCircle },
    resubmitted: { label: 'Resubmitted', classes: 'border-indigo-400/40 bg-indigo-400/5 text-indigo-300', icon: Send },
    under_review: { label: 'Under Review', classes: 'border-purple-400/40 bg-purple-400/5 text-purple-300', icon: Eye },
    suspended: { label: 'Suspended', classes: 'border-night-600 bg-night-800 text-cream-100/50', icon: ShieldOff },
    active: { label: 'Active', classes: 'border-green-400/40 bg-green-400/5 text-green-300', icon: CheckCircle },
    blocked: { label: 'Blocked', classes: 'border-red-400/40 bg-red-400/5 text-red-300', icon: XCircle },
  };
  const c = config[status || ''] || { label: status || 'Unknown', classes: 'border-night-600 bg-night-800 text-cream-100/50', icon: Clock };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-wide2 ${c.classes}`}>
      <Icon size={10} />
      {c.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: any;
  hint?: string;
}) {
  return (
    <div className="border border-night-700 bg-night-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="overline text-cream-100/40">{label}</p>
        <Icon size={16} className="text-gold-500/60" />
      </div>
      <p className="font-display text-d3 text-cream-100">{value}</p>
      {hint && <p className="mt-2 text-xs text-cream-100/40">{hint}</p>}
    </div>
  );
}

/* ============================================================
 * Dashboard View
 * ============================================================ */

function DashboardView({ onError }: { onError: (e: Error) => never }) {
  const [overview, setOverview] = useState<any>(null);
  const [hostelStats, setHostelStats] = useState<any>(null);
  const [appStats, setAppStats] = useState<any>(null);
  const [recentHostels, setRecentHostels] = useState<Hostel[]>([]);
  const [recentApps, setRecentApps] = useState<InstituteApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [overviewRes, hostelStatsRes, appStatsRes, hostelsRes, appsRes] = await Promise.allSettled([
        get('/admin/dashboard/overview'),
        get('/admin/hostels/dashboard'),
        get('/institute-applications/stats', APP_API_BASE),
        get('/admin/hostels?limit=5&sort=-createdAt'),
        get('/institute-applications?limit=5', APP_API_BASE),
      ]);
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value?.data ?? null);
      if (hostelStatsRes.status === 'fulfilled') setHostelStats(hostelStatsRes.value?.data ?? null);
      if (appStatsRes.status === 'fulfilled') setAppStats(appStatsRes.value?.data ?? null);
      if (hostelsRes.status === 'fulfilled') setRecentHostels(hostelsRes.value?.data?.hostels || []);
      if (appsRes.status === 'fulfilled') setRecentApps(appsRes.value?.data?.applications || []);
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load dashboard'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onError]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setRefreshing(true); load(); };

  if (loading) return <CenteredSpinner label="Loading dashboard" />;

  const counts = overview?.counts || {};
  const hostelAgg = hostelStats || {};
  const appAgg = appStats || {};

  return (
    <div>
      {error && <ErrorNote message={error} />}

      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time platform statistics aggregated from the database."
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Students" value={counts.students ?? 0} icon={GraduationCap} />
        <StatCard label="Total Hostels" value={counts.hostels ?? 0} icon={Hotel} hint={`${counts.hostelOwners ?? 0} owners`} />
        <StatCard label="Total Institutes" value={counts.institutes ?? 0} icon={Building2} hint={`${counts.instituteOwners ?? 0} owners`} />
        <StatCard label="Pending Hostels" value={hostelAgg.pendingHostels ?? 0} icon={Clock} hint="Awaiting approval" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Approved Hostels" value={hostelAgg.approvedHostels ?? 0} icon={CheckCircle} />
        <StatCard label="Total Bookings" value={hostelAgg.totalBookings ?? 0} icon={FileText} />
        <StatCard label="Total Reviews" value={hostelAgg.totalReviews ?? 0} icon={Award} />
        <StatCard
          label="Pending Institute Apps"
          value={appAgg.submitted ?? appAgg.changes_requested ?? 0}
          icon={AlertCircle}
        />
      </div>

      {/* Status distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-night-700 bg-night-900 p-6">
          <p className="overline text-gold-400 mb-4">Hostel Status</p>
          <div className="space-y-2">
            {(overview?.distribution?.hostelStatus || []).map((s: any) => (
              <div key={s._id || 'unknown'} className="flex items-center justify-between text-sm">
                <span className="text-cream-100/70 capitalize">{s._id || 'unknown'}</span>
                <span className="font-display text-gold-400">{s.count}</span>
              </div>
            ))}
            {(!overview?.distribution?.hostelStatus || overview.distribution.hostelStatus.length === 0) && (
              <p className="text-sm text-cream-100/30">No hostels yet.</p>
            )}
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-6">
          <p className="overline text-gold-400 mb-4">Recently Submitted Institutes</p>
          <div className="space-y-3">
            {recentApps.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between text-sm border-b border-night-700 pb-2 last:border-0">
                <div className="min-w-0">
                  <p className="text-cream-100 truncate">{a.step1InstituteInfo?.instituteName || 'Untitled'}</p>
                  <p className="text-xs text-cream-100/40">
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
                <StatusBadge status={a.verificationStatus || a.status} />
              </div>
            ))}
            {recentApps.length === 0 && <p className="text-sm text-cream-100/30">No recent applications.</p>}
          </div>
        </div>
      </div>

      {/* Recent hostels */}
      <div className="mt-6 border border-night-700 bg-night-900 p-6">
        <p className="overline text-gold-400 mb-4">Recently Added Hostels</p>
        <div className="space-y-3">
          {recentHostels.map((h) => (
            <div key={h._id} className="flex items-center justify-between text-sm border-b border-night-700 pb-2 last:border-0">
              <div className="min-w-0">
                <p className="text-cream-100 truncate">{h.masked_name || h.name}</p>
                <p className="text-xs text-cream-100/40">
                  {h.address?.city || '—'} · {h.hostel_type} · {h.views_count || 0} views
                </p>
              </div>
              <StatusBadge status={h.status} />
            </div>
          ))}
          {recentHostels.length === 0 && <p className="text-sm text-cream-100/30">No hostels yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Institute Applications — list
 * ============================================================ */

function InstituteApplicationsView({
  onOpen,
  onError,
}: {
  onOpen: (id: string) => void;
  onError: (e: Error) => never;
}) {
  const [apps, setApps] = useState<InstituteApplication[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (page = 1) => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await get(`/institute-applications?${params.toString()}`, APP_API_BASE);
      setApps(data?.data?.applications || []);
      setPagination(data?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load applications'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status, onError]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  if (loading) return <CenteredSpinner label="Loading applications" />;

  return (
    <div>
      {error && <ErrorNote message={error} />}

      <PageHeader
        title="Institute Applications"
        subtitle="Review, approve, reject, or request changes to institute registration applications."
        onRefresh={() => { setRefreshing(true); load(pagination.page); }}
        refreshing={refreshing}
      />

      {/* Filters */}
      <div className="mb-6 border border-night-700 bg-night-900 p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search institute, city, phone, email…"
              className="w-full bg-night-800 border border-night-600 pl-9 pr-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 border border-gold-500/50 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1">
          {['', 'submitted', 'under_review', 'changes_requested', 'verified', 'rejected'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 text-[10px] uppercase tracking-wide2 transition-colors ${
                status === s
                  ? 'bg-gold-500 text-night-900'
                  : 'border border-night-600 text-cream-100/60 hover:border-gold-500 hover:text-gold-400'
              }`}
            >
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {apps.length === 0 ? (
        <EmptyNote title="No applications found" hint="Try adjusting your filters." />
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div
              key={a._id}
              className="border border-night-700 bg-night-900 p-5 hover:border-gold-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-cream-100">
                    {a.step1InstituteInfo?.instituteName || 'Untitled Institute'}
                  </h3>
                  <p className="text-sm text-cream-100/60 mt-1">
                    {a.step3LocationContact?.city ? `${a.step3LocationContact.city}, ${a.step3LocationContact.state || ''}` : '—'}
                    {a.owner?.name && ` · by ${a.owner.name}`}
                  </p>
                  <p className="text-xs text-cream-100/40 mt-2">
                    Submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}
                    {' · '}
                    Step {a.currentStep}/{TOTAL_STEPS} · {a.completionPercentage}%
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={a.verificationStatus || a.status} />
                  <button
                    onClick={() => onOpen(a._id)}
                    className="inline-flex items-center gap-2 border border-gold-500/40 px-4 py-2 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors"
                  >
                    <Eye size={12} />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-xs text-cream-100/50">
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => load(pagination.page + 1)}
            className="inline-flex items-center gap-1 px-3 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-30"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Institute Application — review + actions
 * ============================================================ */

function InstituteReviewView({
  applicationId,
  onBack,
  onError,
}: {
  applicationId: string;
  onBack: () => void;
  onError: (e: Error) => never;
}) {
  const [app, setApp] = useState<InstituteApplication | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [modal, setModal] = useState<'changes' | 'reject' | 'suspend' | null>(null);
  const [modalText, setModalText] = useState('');

  const load = useCallback(async () => {
    try {
      setError(null);
      const [appRes, histRes] = await Promise.allSettled([
        get(`/institute-applications/${applicationId}`, APP_API_BASE),
        get(`/institute-applications/${applicationId}/history`, APP_API_BASE),
      ]);
      if (appRes.status === 'fulfilled') setApp(appRes.value?.data || null);
      if (histRes.status === 'fulfilled') setHistory(histRes.value?.data || []);
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load application'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applicationId, onError]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (action: 'approve' | 'request-changes' | 'reject' | 'suspend', body?: any) => {
    if (!app) return;
    setProcessing(true);
    setError(null);
    try {
      const data = await patch(`/institute-applications/${app._id}/${action}`, body || {}, APP_API_BASE);
      // Reload both the app and the history
      await load();
      setModal(null);
      setModalText('');
    } catch (err: any) {
      setError(err?.message || `Action failed`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = () => {
    if (!confirm('Approve this institute application? An Institute record will be created and the listing will be live.')) return;
    doAction('approve');
  };

  const handleChanges = () => {
    if (!modalText.trim()) { setError('Please enter feedback for the changes.'); return; }
    doAction('request-changes', { feedback: modalText.trim() });
  };

  const handleReject = () => {
    if (!modalText.trim()) { setError('Please enter a rejection reason.'); return; }
    doAction('reject', { reason: modalText.trim() });
  };

  const handleSuspend = () => {
    if (!modalText.trim()) { setError('Please enter a suspension reason.'); return; }
    doAction('suspend', { reason: modalText.trim() });
  };

  if (loading) return <CenteredSpinner label="Loading application" />;
  if (!app) return <EmptyNote title="Application not found" hint="It may have been deleted." />;

  const canApprove = (app.verificationStatus || app.status) === 'submitted' || (app.verificationStatus || app.status) === 'changes_requested' || (app.verificationStatus || app.status) === 'under_review';
  const canSuspend = (app.verificationStatus || app.status) === 'verified';

  return (
    <div>
      {error && <ErrorNote message={error} />}

      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-cream-100/60 hover:text-gold-400 transition-colors"
      >
        <ChevronLeft size={14} />
        Back to applications
      </button>

      <PageHeader
        title={app.step1InstituteInfo?.instituteName || 'Institute Application'}
        subtitle={`Application ${app._id} · submitted ${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : '—'}`}
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
        actions={<StatusBadge status={app.verificationStatus || app.status} />}
      />

      {/* Action bar */}
      <div className="mb-8 border border-night-700 bg-night-900 p-5 flex flex-wrap items-center gap-3">
        {canApprove && (
          <>
            <ActionButton onClick={handleApprove} disabled={processing} variant="primary" icon={CheckCircle2}>
              Approve
            </ActionButton>
            <ActionButton onClick={() => setModal('changes')} disabled={processing} variant="outline" icon={AlertCircle}>
              Request Changes
            </ActionButton>
            <ActionButton onClick={() => setModal('reject')} disabled={processing} variant="danger" icon={XCircle}>
              Reject
            </ActionButton>
          </>
        )}
        {canSuspend && (
          <ActionButton onClick={() => setModal('suspend')} disabled={processing} variant="danger" icon={ShieldOff}>
            Suspend
          </ActionButton>
        )}
        {!canApprove && !canSuspend && (
          <p className="text-sm text-cream-100/40">No actions available in current state.</p>
        )}
      </div>

      {/* Application data — all 14 steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <ApplicationStepSection step={1} label={STEP_LABELS[0]} open>
            <DataGrid
              items={[
                ['Institute name', app.step1InstituteInfo?.instituteName],
                ['Established', app.step1InstituteInfo?.establishedYear],
                ['Registration #', app.step1InstituteInfo?.registrationNumber],
                ['Website', app.step1InstituteInfo?.websiteUrl, 'link'],
                ['Total branches', app.step1InstituteInfo?.totalBranches],
                ['Total students', app.step1InstituteInfo?.totalStudents],
                ['About', app.step1InstituteInfo?.about],
              ]}
            />
            {app.step1InstituteInfo?.logoPreview && (
              <div className="mt-4">
                <p className="overline text-cream-100/40 mb-2">Logo</p>
                <img src={app.step1InstituteInfo.logoPreview} alt="Logo" className="h-20 w-20 object-cover border border-night-600" />
              </div>
            )}
          </ApplicationStepSection>

          <ApplicationStepSection step={3} label={STEP_LABELS[2]} open>
            <DataGrid
              items={[
                ['City', app.step3LocationContact?.city],
                ['State', app.step3LocationContact?.state],
                ['Address', app.step3LocationContact?.fullAddress],
                ['Pincode', app.step3LocationContact?.pincode],
                ['Phone', app.step3LocationContact?.phone],
                ['Email', app.step3LocationContact?.email],
                ['WhatsApp', app.step3LocationContact?.whatsapp],
              ]}
            />
          </ApplicationStepSection>

          <ApplicationStepSection step={14} label={STEP_LABELS[13]}>
            <DataGrid
              items={[
                ['Owner name', app.step14Verification?.ownerName],
                ['Designation', app.step14Verification?.designation],
                ['GST', app.step14Verification?.gstNumber],
                ['PAN', app.step14Verification?.panNumber],
                ['License #', app.step14Verification?.licenseNumber],
              ]}
            />
            {(app.step14Verification?.idProofPreview || app.step14Verification?.registrationDocPreview) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {app.step14Verification?.idProofPreview && (
                  <DocumentPreview label="ID Proof" url={app.step14Verification.idProofPreview} />
                )}
                {app.step14Verification?.registrationDocPreview && (
                  <DocumentPreview label="Registration Doc" url={app.step14Verification.registrationDocPreview} />
                )}
              </div>
            )}
          </ApplicationStepSection>
        </div>

        {/* Right column: applicant + history */}
        <div className="space-y-4">
          <div className="border border-night-700 bg-night-900 p-5">
            <p className="overline text-gold-400 mb-3">Applicant</p>
            {app.owner ? (
              <div className="space-y-1 text-sm">
                <p className="text-cream-100">{app.owner.name}</p>
                <p className="text-cream-100/60">{app.owner.email}</p>
                {app.owner.phone && <p className="text-cream-100/60">{app.owner.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-cream-100/40">Owner not populated</p>
            )}
          </div>

          <div className="border border-night-700 bg-night-900 p-5">
            <p className="overline text-gold-400 mb-3">Progress</p>
            <p className="font-display text-d4 text-cream-100">{app.completionPercentage ?? 0}%</p>
            <p className="text-xs text-cream-100/40 mt-1">Step {app.currentStep} of {TOTAL_STEPS}</p>
            <div className="h-px bg-night-700 mt-4 relative">
              <div
                className="absolute inset-y-0 left-0 bg-gold-500"
                style={{ width: `${app.completionPercentage ?? 0}%` }}
              />
            </div>
          </div>

          <div className="border border-night-700 bg-night-900 p-5">
            <div className="flex items-center gap-2 mb-3">
              <History size={12} className="text-gold-500/60" />
              <p className="overline text-gold-400">Verification History</p>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-cream-100/30">No actions yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="border-l-2 border-night-600 pl-3 py-1">
                    <p className="text-xs text-cream-100/60 capitalize">{h.action} · {h.status}</p>
                    {h.adminName && <p className="text-xs text-cream-100/40">by {h.adminName}</p>}
                    {h.reason && <p className="text-xs text-cream-100/80 mt-1">{h.reason}</p>}
                    <p className="text-[10px] text-cream-100/30 mt-1">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <Modal
          title={modal === 'changes' ? 'Request Changes' : modal === 'reject' ? 'Reject Application' : 'Suspend Institute'}
          onClose={() => { setModal(null); setModalText(''); setError(null); }}
          onConfirm={
            modal === 'changes' ? handleChanges :
            modal === 'reject' ? handleReject : handleSuspend
          }
          processing={processing}
          placeholder={
            modal === 'changes' ? 'What changes does the institute need to make?' :
            modal === 'reject' ? 'Why is this application being rejected?' :
            'Why is this verified institute being suspended?'
          }
          value={modalText}
          onChange={setModalText}
        />
      )}
    </div>
  );
}

function ApplicationStepSection({
  step,
  label,
  open: defaultOpen = false,
  children,
}: {
  step: number;
  label: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-night-700 bg-night-900">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="overline text-gold-400">Step {String(step).padStart(2, '0')}</p>
          <p className="font-display text-base text-cream-100 mt-1">{label}</p>
        </div>
        {open ? <ChevronLeft size={14} className="rotate-90 text-cream-100/40" /> : <ChevronRight size={14} className="text-cream-100/40" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-night-700 pt-4">{children}</div>}
    </div>
  );
}

function DataGrid({ items }: { items: Array<[string, any, 'link'?, string?] | [string, any]> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      {items.map(([label, value, type], i) => {
        if (!value) return null;
        return (
          <div key={i}>
            <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40 mb-1">{label}</p>
            {type === 'link' ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 underline break-all inline-flex items-center gap-1"
              >
                {String(value)} <ExternalLink size={10} />
              </a>
            ) : (
              <p className="text-cream-100 break-words">{String(value)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocumentPreview({ label, url }: { label: string; url: string }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  return (
    <div>
      <p className="overline text-cream-100/40 mb-2">{label}</p>
      {isImage ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={label} className="max-h-48 w-auto border border-night-600" />
        </a>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 underline"
        >
          <FileText size={14} />
          View document
        </a>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  variant = 'outline',
  icon: Icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  icon: any;
  children: React.ReactNode;
}) {
  const skins = {
    primary: 'bg-gold-500 text-night-900 hover:bg-gold-400',
    outline: 'border border-gold-500/50 text-gold-400 hover:bg-gold-500 hover:text-night-900',
    danger: 'border border-red-500/40 text-red-300 hover:bg-red-500/10',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-wide2 transition-colors disabled:opacity-50 ${skins[variant]}`}
    >
      <Icon size={12} />
      {children}
    </button>
  );
}

function Modal({
  title,
  onClose,
  onConfirm,
  processing,
  placeholder,
  value,
  onChange,
}: {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  processing: boolean;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-night-700 bg-night-900 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-lg text-cream-100">{title}</h3>
          <button onClick={onClose} className="text-cream-100/40 hover:text-cream-100">
            <X size={16} />
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-night-800 border border-night-600 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className="px-5 py-2 bg-gold-500 text-[10px] uppercase tracking-wide2 text-night-900 hover:bg-gold-400 transition-colors disabled:opacity-50"
          >
            {processing ? 'Submitting…' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
 * Hostel Approvals + All Hostels
 * ============================================================ */

function HostelApprovalsView({ onError }: { onError: (e: Error) => never }) {
  return (
    <HostelListView
      title="Pending Hostel Approvals"
      subtitle="Review and approve or reject new hostel listings."
      fixedStatus="pending"
      onError={onError}
    />
  );
}

function AllHostelsView({ onError }: { onError: (e: Error) => never }) {
  return (
    <HostelListView
      title="All Hostels"
      subtitle="Manage the status of every hostel on the platform."
      onError={onError}
    />
  );
}

function HostelListView({
  title,
  subtitle,
  fixedStatus,
  onError,
}: {
  title: string;
  subtitle: string;
  fixedStatus?: string;
  onError: (e: Error) => never;
}) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(fixedStatus || '');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (filter) params.set('status', filter);
      const data = await get(`/admin/hostels?${params.toString()}`);
      setHostels(data?.data?.hostels || []);
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load hostels'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, onError]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!confirm(`${newStatus === 'approved' ? 'Approve' : 'Reject'} this hostel?`)) return;
    setBusyId(id);
    try {
      await patch(`/admin/hostels/${id}/status`, { status: newStatus });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <CenteredSpinner label="Loading hostels" />;

  return (
    <div>
      {error && <ErrorNote message={error} />}

      <PageHeader
        title={title}
        subtitle={subtitle}
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
      />

      {!fixedStatus && (
        <div className="mb-6 flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-[10px] uppercase tracking-wide2 transition-colors ${
                filter === s
                  ? 'bg-gold-500 text-night-900'
                  : 'border border-night-600 text-cream-100/60 hover:border-gold-500 hover:text-gold-400'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      )}

      {hostels.length === 0 ? (
        <EmptyNote title="No hostels found" hint="No hostels match the current filter." />
      ) : (
        <div className="space-y-3">
          {hostels.map((h) => (
            <div key={h._id} className="border border-night-700 bg-night-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-cream-100">
                    {h.masked_name || h.name}
                  </h3>
                  <p className="text-sm text-cream-100/60 mt-1">
                    {h.hostel_type} · {h.address?.area ? `${h.address.area}, ` : ''}{h.address?.city}{h.address?.state ? `, ${h.address.state}` : ''}
                  </p>
                  <div className="flex gap-4 text-xs text-cream-100/40 mt-2">
                    {h.address?.pincode && <span>{h.address.pincode}</span>}
                    {h.total_hostel_beds != null && <span>{h.total_hostel_beds} beds</span>}
                    {h.owner?.name && <span>by {h.owner.name}</span>}
                    <span>Added {new Date(h.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={h.status} />
                  {h.status !== 'approved' && (
                    <button
                      onClick={() => setStatus(h._id, 'approved')}
                      disabled={busyId === h._id}
                      className="inline-flex items-center gap-1.5 border border-green-500/40 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-green-300 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={10} />
                      Approve
                    </button>
                  )}
                  {h.status !== 'rejected' && (
                    <button
                      onClick={() => setStatus(h._id, 'rejected')}
                      disabled={busyId === h._id}
                      className="inline-flex items-center gap-1.5 border border-red-500/40 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={10} />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Owners
 * ============================================================ */

function HostelOwnersView({ onError }: { onError: (e: Error) => never }) {
  return <OwnersListView title="Hostel Owners" subtitle="All registered hostel owners." endpoint="/admin/owners" onError={onError} />;
}

function InstituteOwnersView({ onError }: { onError: (e: Error) => never }) {
  return <OwnersListView title="Institute Owners" subtitle="All registered institute owners." endpoint="/admin/institute-owners" onError={onError} />;
}

function OwnersListView({
  title,
  subtitle,
  endpoint,
  onError,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  onError: (e: Error) => never;
}) {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (q = '') => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (q) params.set('search', q);
      const data = await get(`${endpoint}?${params.toString()}`);
      setOwners(data?.data?.owners || []);
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load owners'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [endpoint, onError]);

  useEffect(() => { load(''); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    load(searchInput);
  };

  if (loading) return <CenteredSpinner label="Loading owners" />;

  return (
    <div>
      {error && <ErrorNote message={error} />}

      <PageHeader
        title={title}
        subtitle={subtitle}
        onRefresh={() => { setRefreshing(true); load(search); }}
        refreshing={refreshing}
      />

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="w-full bg-night-800 border border-night-600 pl-9 pr-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 border border-gold-500/50 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors"
        >
          Search
        </button>
      </form>

      {owners.length === 0 ? (
        <EmptyNote title="No owners found" hint="No owners match the current filter." />
      ) : (
        <div className="border border-night-700 bg-night-900 divide-y divide-night-700">
          {owners.map((o: any) => (
            <div key={o._id} className="p-5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-base text-cream-100">{o.name}</p>
                <p className="text-sm text-cream-100/60 mt-1">{o.email}{o.phone ? ` · ${o.phone}` : ''}</p>
                {o.hostels && o.hostels.length > 0 && (
                  <p className="text-xs text-cream-100/40 mt-2">{o.hostels.length} hostel(s)</p>
                )}
                {o.institutes && o.institutes.length > 0 && (
                  <p className="text-xs text-cream-100/40 mt-2">{o.institutes.length} institute(s)</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-cream-100/40">Joined {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Students + Analytics — using dashboard counts (no list endpoint)
 * ============================================================ */

function StudentsView() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await get('/admin/dashboard/overview');
        if (mounted) setCount(data?.data?.counts?.students ?? 0);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load students count');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <PageHeader title="Students" subtitle="Platform-registered student accounts." />

      {loading ? (
        <CenteredSpinner label="Loading" />
      ) : error ? (
        <ErrorNote message={error} />
      ) : (
        <div className="border border-night-700 bg-night-900 p-8 max-w-md">
          <p className="overline text-gold-400">Total registered students</p>
          <p className="font-display text-d1 text-cream-100 mt-2">{count ?? 0}</p>
          <p className="text-xs text-cream-100/40 mt-3">
            A detailed student directory is not yet exposed by the backend.
          </p>
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ onError }: { onError: (e: Error) => never }) {
  const [overview, setOverview] = useState<any>(null);
  const [hostelStats, setHostelStats] = useState<any>(null);
  const [appStats, setAppStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [a, b, c] = await Promise.allSettled([
        get('/admin/dashboard/overview'),
        get('/admin/hostels/dashboard'),
        get('/institute-applications/stats', APP_API_BASE),
      ]);
      if (a.status === 'fulfilled') setOverview(a.value?.data ?? null);
      if (b.status === 'fulfilled') setHostelStats(b.value?.data ?? null);
      if (c.status === 'fulfilled') setAppStats(c.value?.data ?? null);
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load analytics'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onError]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <CenteredSpinner label="Loading analytics" />;

  const counts = overview?.counts || {};
  const growth = overview?.growth || {};

  return (
    <div>
      {error && <ErrorNote message={error} />}

      <PageHeader
        title="Analytics & Insights"
        subtitle="Aggregated platform metrics from the live database."
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-night-700 bg-night-900 p-6">
          <p className="overline text-gold-400 mb-4">Platform Counts</p>
          <div className="space-y-3">
            <Stat label="Students" value={counts.students ?? 0} />
            <Stat label="Hostels" value={counts.hostels ?? 0} />
            <Stat label="Institutes" value={counts.institutes ?? 0} />
            <Stat label="Hostel Owners" value={counts.hostelOwners ?? 0} />
            <Stat label="Institute Owners" value={counts.instituteOwners ?? 0} />
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-6">
          <p className="overline text-gold-400 mb-4">Hostel Activity</p>
          <div className="space-y-3">
            <Stat label="Total Hostels" value={hostelStats?.totalHostels ?? 0} />
            <Stat label="Pending" value={hostelStats?.pendingHostels ?? 0} />
            <Stat label="Approved" value={hostelStats?.approvedHostels ?? 0} />
            <Stat label="Rejected" value={hostelStats?.rejectedHostels ?? 0} />
            <Stat label="Total Bookings" value={hostelStats?.totalBookings ?? 0} />
            <Stat label="Total Reviews" value={hostelStats?.totalReviews ?? 0} />
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-6">
          <p className="overline text-gold-400 mb-4">Institute Applications</p>
          <div className="space-y-3">
            <Stat label="Total" value={appStats?.total ?? 0} />
            <Stat label="Submitted" value={appStats?.submitted ?? 0} />
            <Stat label="Changes Requested" value={appStats?.changes_requested ?? 0} />
            <Stat label="Verified" value={appStats?.verified ?? 0} />
            <Stat label="Rejected" value={appStats?.rejected ?? 0} />
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-6">
          <p className="overline text-gold-400 mb-4">Growth (Last 6 months)</p>
          <div className="space-y-3">
            <GrowthBlock title="Students" data={growth.students || []} />
            <GrowthBlock title="Hostels" data={growth.hostels || []} />
            <GrowthBlock title="Institutes" data={growth.institutes || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-cream-100/60">{label}</span>
      <span className="font-display text-cream-100">{value}</span>
    </div>
  );
}

function GrowthBlock({ title, data }: { title: string; data: Array<{ _id: number; count: number }> }) {
  const total = data.reduce((sum, m) => sum + m.count, 0);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-cream-100/60">{title}</span>
        <span className="font-display text-cream-100">{total}</span>
      </div>
      <div className="flex items-end gap-1 mt-2 h-8">
        {Array.from({ length: 6 }, (_, i) => {
          const m = data.find((d) => d._id === i + 1);
          const h = m ? Math.max(2, Math.round((m.count / Math.max(1, total)) * 32)) : 2;
          return <div key={i} className="flex-1 bg-gold-500/40" style={{ height: h }} title={`${m?.count ?? 0}`} />;
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * Misc
 * ============================================================ */

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-4">
      <Spinner label="" size="md" />
      <p className="overline text-cream-100/50">{label}…</p>
    </div>
  );
}
