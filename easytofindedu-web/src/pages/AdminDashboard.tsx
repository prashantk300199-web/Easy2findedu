import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScholarshipsAdminView } from './admin/ScholarshipsAdminView';
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
  History,
  CheckCircle2,
  X,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Hash,
} from 'lucide-react';

/* ============================================================
 * Constants — single source of truth for backend endpoints
 * ============================================================ */

const API_BASE = 'https://easytofindedu.onrender.com/api/v1';
// Institute applications are mounted at /api/admin/* (no v1)
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

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  lastQualification?: string;
  status?: string;
  city?: string;
  state?: string;
  authProvider?: string;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
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
  verificationHistory?: Array<{ action: string; status: string; adminName?: string; reason?: string; timestamp: string }>;
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
  [key: string]: any;
}

interface CollegeApplication {
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
  verificationHistory?: Array<{ action: string; status: string; adminName?: string; reason?: string; timestamp: string }>;
  step1BasicInfo?: { collegeName?: string; shortName?: string; institutionType?: string; ownershipType?: string; establishedYear?: number; about?: string; website?: string; contactEmail?: string; contactPhone?: string };
  step2Location?: { fullAddress?: string; city?: string; state?: string; district?: string; pincode?: string; country?: string };
  step3Affiliation?: any;
  step4Courses?: any;
  step5AdmissionFees?: any;
  step6Facilities?: any;
  step7Hostel?: any;
  step8Placements?: any;
  step9Scholarships?: any;
  step10Gallery?: any;
  step11Documents?: any;
  [key: string]: any;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_results: number;
  per_page: number;
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
 * API helper
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
 * Main
 * ============================================================ */

export function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [profile, setProfile] = useState<AdminProfile | null>(() => getAdminProfile());
  const [view, setView] = useState<ViewKey>('dashboard');
  const [authExpired, setAuthExpired] = useState(false);

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
      setView={setView}
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
      {view === 'college-applications' && (
        <CollegeApplicationsView
          onOpen={(id) => setView({ kind: 'college-review', id } as any)}
          onError={requireLogin}
        />
      )}
      {typeof view === 'object' && (view as any).kind === 'college-review' && (
        <CollegeReviewView
          applicationId={(view as any).id as string}
          onBack={() => setView('college-applications')}
          onError={requireLogin}
        />
      )}
      {view === 'hostel-approvals' && <HostelApprovalsView onError={requireLogin} />}
      {view === 'all-hostels' && <AllHostelsView onError={requireLogin} />}
      {view === 'hostel-owners' && <HostelOwnersView onError={requireLogin} />}
      {view === 'institute-owners' && <InstituteOwnersView onError={requireLogin} />}
      {view === 'students' && <StudentsView onError={requireLogin} />}
      {view === 'analytics' && <AnalyticsView onError={requireLogin} />}
      {view === 'scholarships' && <ScholarshipsAdminView />}
    </Shell>
  );
}

type ViewKey =
  | 'dashboard'
  | 'institute-applications'
  | { kind: 'institute-review'; id: string }
  | 'college-applications'
  | { kind: 'college-review'; id: string }
  | 'hostel-approvals'
  | 'all-hostels'
  | 'hostel-owners'
  | 'institute-owners'
  | 'students'
  | 'analytics'
  | 'scholarships';

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
        { method: 'POST', body: JSON.stringify({ email, password }) },
        API_BASE,
      );
      const token = data?.data?.token ?? data?.token;
      const admin = data?.data?.admin ?? data?.admin;
      if (!token || !admin) throw new Error('Unexpected response from server');
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
    <div className="bg-night-950 min-h-screen w-full flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md border border-night-700 bg-night-900 p-8 sm:p-10 md:p-12"
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
            <label className="block text-[10px] uppercase tracking-wide2 text-gold-400 mb-2">Email</label>
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
            <label className="block text-[10px] uppercase tracking-wide2 text-gold-400 mb-2">Password</label>
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
 * Shell (sidebar + main)
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
    { key: 'institute-applications', label: 'Institute Apps', icon: Building2 },
    { key: 'college-applications', label: 'College Apps', icon: Building2 },
    { key: 'hostel-approvals', label: 'Hostel Approvals', icon: ShieldOff },
    { key: 'all-hostels', label: 'All Hostels', icon: Hotel },
    { key: 'hostel-owners', label: 'Hostel Owners', icon: Users },
    { key: 'institute-owners', label: 'Institute Owners', icon: Users },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const activeKey: string = typeof view === 'string' ? view : (view as any).kind;
  const isOnReview = activeKey === 'institute-review' || activeKey === 'college-review';

  return (
    <div className="bg-night-950 min-h-screen w-full flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-60 xl:w-64 bg-night-900 border-b lg:border-b-0 lg:border-r border-night-700 flex-shrink-0 lg:min-h-screen flex flex-col">
        <div className="p-5 lg:p-6 border-b border-night-700">
          <p className="overline text-gold-400">EasyToFindEdu</p>
          <h1 className="mt-2 font-display text-lg lg:text-xl text-cream-100">Admin Portal</h1>
        </div>

        {/* Scrollable nav: visible on mobile (horizontal) and vertical (desktop) */}
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto flex-1 p-2 lg:p-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeKey === item.key || ((item.key === 'institute-applications' || item.key === 'college-applications') && isOnReview);
            return (
              <button
                key={typeof item.key === 'string' ? item.key : 'institute-review'}
                onClick={() => setView(item.key)}
                className={`flex-shrink-0 inline-flex items-center gap-3 px-3 lg:px-4 py-2.5 text-sm transition-colors duration-200 whitespace-nowrap ${
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

        <div className="hidden lg:block p-4 border-t border-night-700">
          <p className="text-xs text-cream-100 font-medium truncate">{profile.name}</p>
          <p className="text-[10px] text-cream-100/50 truncate">{profile.email}</p>
          <button
            onClick={onLogout}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-xs text-cream-100/70 hover:text-cream-100 hover:bg-night-800 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-night-700 bg-night-900/60 backdrop-blur-sm sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="overline text-gold-400 truncate">{getViewLabel(view)}</p>
              <p className="text-[10px] text-cream-100/40 mt-1 truncate">
                Signed in as {profile.name} · {profile.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="lg:hidden inline-flex items-center gap-1.5 border border-night-600 px-3 py-2 text-[10px] uppercase tracking-wide2 text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors flex-shrink-0"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </header>

        {/* scrollable content area with min-w-0 to prevent overflow */}
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-page mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function getViewLabel(view: ViewKey): string {
  if (typeof view === 'string') {
    return ({
      'dashboard': 'Overview',
      'institute-applications': 'Institute Applications',
      'college-applications': 'College Applications',
      'hostel-approvals': 'Hostel Approvals',
      'all-hostels': 'All Hostels',
      'hostel-owners': 'Hostel Owners',
      'institute-owners': 'Institute Owners',
      'students': 'Registered Students',
      'analytics': 'Analytics',
      'scholarships': 'Scholarships',
    } as Record<string, string>)[view] || 'Admin';
  }
  return 'Application Review';
}

/* ============================================================
 * Shared UI bits
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
    <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-night-700">
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-d2 text-cream-100 break-words">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-cream-100/50 max-w-2xl break-words">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
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
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-wide2 whitespace-nowrap ${c.classes}`}>
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
    <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
      <div className="flex items-center justify-between mb-5">
        <p className="overline text-cream-100/40 truncate">{label}</p>
        <Icon size={16} className="text-gold-500/60 flex-shrink-0" />
      </div>
      <p className="font-display text-d3 text-cream-100 break-words">{value}</p>
      {hint && <p className="mt-2 text-xs text-cream-100/40 break-words">{hint}</p>}
    </div>
  );
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-4 min-h-[300px]">
      <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      <p className="overline text-cream-100/50">{label}…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-wine/40 bg-wine/5 p-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="overline text-wine mb-1">Error</p>
        <p className="text-sm text-cream-100/80 break-words">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 inline-flex items-center gap-2 border border-wine/50 px-3 py-2 text-[10px] uppercase tracking-wide2 text-cream-100/80 hover:bg-wine/10 transition-colors"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border border-night-700 bg-night-900/50 py-16 px-6 text-center">
      <p className="overline text-gold-400 mb-2">Nothing to show</p>
      <p className="font-display text-lg text-cream-100">{title}</p>
      {hint && <p className="mt-2 text-sm text-cream-100/40 max-w-md mx-auto break-words">{hint}</p>}
    </div>
  );
}

/* ============================================================
 * Generic Modal (scrollable body, no clipping)
 * ============================================================ */

function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`w-full ${sizes[size]} max-h-[90vh] flex flex-col border border-night-700 bg-night-900`}
      >
        <div className="flex items-center justify-between p-5 border-b border-night-700 flex-shrink-0">
          <h3 className="font-display text-lg text-cream-100 truncate pr-4">{title}</h3>
          <button onClick={onClose} className="text-cream-100/50 hover:text-cream-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">{children}</div>
      </motion.div>
    </div>
  );
}

/* ============================================================
 * Dashboard
 * ============================================================ */

function DashboardView({ onError }: { onError: (e: Error) => never }) {
  const [overview, setOverview] = useState<any>(null);
  const [hostelStats, setHostelStats] = useState<any>(null);
  const [appStats, setAppStats] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [recentHostels, setRecentHostels] = useState<Hostel[]>([]);
  const [recentApps, setRecentApps] = useState<InstituteApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [o, h, a, s, rh, ra] = await Promise.allSettled([
        get('/admin/dashboard/overview'),
        get('/admin/hostels/dashboard'),
        get('/institute-applications/stats', APP_API_BASE),
        get('/admin/students/stats/summary'),
        get('/admin/hostels?limit=5&sort=-createdAt'),
        get('/institute-applications?limit=5', APP_API_BASE),
      ]);
      if (o.status === 'fulfilled') setOverview(o.value?.data ?? null);
      if (h.status === 'fulfilled') setHostelStats(h.value?.data ?? null);
      if (a.status === 'fulfilled') setAppStats(a.value?.data ?? null);
      if (s.status === 'fulfilled') setStudentStats(s.value?.data ?? null);
      if (rh.status === 'fulfilled') setRecentHostels(rh.value?.data?.hostels || []);
      if (ra.status === 'fulfilled') setRecentApps(ra.value?.data?.applications || []);
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
  const hs = hostelStats || {};
  const as_ = appStats || {};
  const ss = studentStats || {};

  return (
    <div className="space-y-6 lg:space-y-8 min-w-0">
      {error && <ErrorState message={error} onRetry={handleRefresh} />}

      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time platform statistics aggregated from the database."
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value={ss.total ?? counts.students ?? 0} icon={GraduationCap} hint={`${ss.verified ?? 0} verified`} />
        <StatCard label="Total Hostels" value={counts.hostels ?? 0} icon={Hotel} hint={`${counts.hostelOwners ?? 0} owners`} />
        <StatCard label="Total Institutes" value={counts.institutes ?? 0} icon={Building2} hint={`${counts.instituteOwners ?? 0} owners`} />
        <StatCard label="Pending Hostels" value={hs.pendingHostels ?? 0} icon={Clock} hint="Awaiting approval" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Approved Hostels" value={hs.approvedHostels ?? 0} icon={CheckCircle} />
        <StatCard label="Total Bookings" value={hs.totalBookings ?? 0} icon={FileText} />
        <StatCard label="Total Reviews" value={hs.totalReviews ?? 0} icon={TrendingUp} />
        <StatCard
          label="Pending Institute Apps"
          value={as_.submitted ?? as_.changes_requested ?? 0}
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-w-0">
        <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
          <p className="overline text-gold-400 mb-4">Hostel Status</p>
          <div className="space-y-2">
            {(overview?.distribution?.hostelStatus || []).map((s: any) => (
              <div key={s._id || 'unknown'} className="flex items-center justify-between text-sm gap-2">
                <span className="text-cream-100/70 capitalize truncate">{s._id || 'unknown'}</span>
                <span className="font-display text-gold-400 flex-shrink-0">{s.count}</span>
              </div>
            ))}
            {(!overview?.distribution?.hostelStatus || overview.distribution.hostelStatus.length === 0) && (
              <p className="text-sm text-cream-100/30">No hostels yet.</p>
            )}
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
          <p className="overline text-gold-400 mb-4">Recently Submitted Institutes</p>
          <div className="space-y-3">
            {recentApps.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between text-sm border-b border-night-700 pb-2 last:border-0 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-cream-100 truncate">{a.step1InstituteInfo?.instituteName || 'Untitled'}</p>
                  <p className="text-xs text-cream-100/40 truncate">
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

      <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
        <p className="overline text-gold-400 mb-4">Recently Added Hostels</p>
        <div className="space-y-3">
          {recentHostels.map((h) => (
            <div key={h._id} className="flex items-center justify-between text-sm border-b border-night-700 pb-2 last:border-0 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-cream-100 truncate">{h.masked_name || h.name}</p>
                <p className="text-xs text-cream-100/40 truncate">
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
  const [pagination, setPagination] = useState<Pagination>({ current_page: 1, total_pages: 1, total_results: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');

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
      setPagination(data?.data?.pagination || { current_page: 1, total_pages: 1, total_results: 0, per_page: 10 });
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load applications'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status, onError]);

  useEffect(() => { load(1); }, [load]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };

  if (loading) return <CenteredSpinner label="Loading applications" />;

  return (
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} onRetry={() => load(pagination.current_page)} />}

      <PageHeader
        title="Institute Applications"
        subtitle="Review, approve, reject, or request changes to institute registration applications."
        onRefresh={() => { setRefreshing(true); load(pagination.current_page); }}
        refreshing={refreshing}
      />

      {/* Filters */}
      <div className="border border-night-700 bg-night-900 p-4 flex flex-col lg:flex-row gap-3 min-w-0">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
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
            className="px-5 py-2 border border-gold-500/50 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors flex-shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0 flex-shrink-0">
          {['', 'submitted', 'under_review', 'changes_requested', 'verified', 'rejected'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`flex-shrink-0 px-3 py-2 text-[10px] uppercase tracking-wide2 transition-colors whitespace-nowrap ${
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

      {apps.length === 0 ? (
        <EmptyState title="No applications found" hint="Try adjusting your filters." />
      ) : (
        <div className="space-y-3 min-w-0">
          {apps.map((a) => (
            <div
              key={a._id}
              className="border border-night-700 bg-night-900 p-4 sm:p-5 hover:border-gold-500/40 transition-colors min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-cream-100 break-words">
                    {a.step1InstituteInfo?.instituteName || 'Untitled Institute'}
                  </h3>
                  <p className="text-sm text-cream-100/60 mt-1 break-words">
                    {a.step3LocationContact?.city ? `${a.step3LocationContact.city}${a.step3LocationContact.state ? `, ${a.step3LocationContact.state}` : ''}` : 'Location not provided'}
                    {a.owner?.name && ` · by ${a.owner.name}`}
                  </p>
                  <p className="text-xs text-cream-100/40 mt-2">
                    Submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}
                    {' · '}
                    Step {a.currentStep}/{TOTAL_STEPS} · {a.completionPercentage}%
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
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

      {pagination.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            disabled={pagination.current_page <= 1}
            onClick={() => load(pagination.current_page - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-xs text-cream-100/50">
            Page {pagination.current_page} of {pagination.total_pages} · {pagination.total_results} total
          </span>
          <button
            disabled={pagination.current_page >= pagination.total_pages}
            onClick={() => load(pagination.current_page + 1)}
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
 * Institute Application Review
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
  const [showAllSteps, setShowAllSteps] = useState(false);

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
      await patch(`/institute-applications/${app._id}/${action}`, body || {}, APP_API_BASE);
      await load();
      setModal(null);
      setModalText('');
    } catch (err: any) {
      setError(err?.message || 'Action failed');
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
  if (!app) return <EmptyState title="Application not found" hint="It may have been deleted." />;

  const status = app.verificationStatus || app.status;
  const canApprove = status === 'submitted' || status === 'changes_requested' || status === 'under_review';
  const canSuspend = status === 'verified';

  return (
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} />}

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-cream-100/60 hover:text-gold-400 transition-colors"
      >
        <ChevronLeft size={14} />
        Back to applications
      </button>

      <PageHeader
        title={app.step1InstituteInfo?.instituteName || 'Institute Application'}
        subtitle={`Application ${app._id} · submitted ${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : '—'}`}
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
        actions={<StatusBadge status={status} />}
      />

      {/* Action bar — always visible, scrolls into view */}
      {/* Documents-missing warning — shown when the previews are blob URLs or the
          file URLs were never persisted. Approval will be blocked by the backend. */}
      {(() => {
        const logoBlob = app.step1InstituteInfo?.logoPreview?.startsWith('blob:');
        const idBlob = app.step14Verification?.idProofPreview?.startsWith('blob:');
        const regBlob = app.step14Verification?.registrationDocPreview?.startsWith('blob:');
        const noLogoFile = !app.step1InstituteInfo?.logoFile;
        const noIdFile = !app.step14Verification?.idProofFile;
        const noRegFile = !app.step14Verification?.registrationDocFile;
        const anyMissing = logoBlob || idBlob || regBlob || noLogoFile || noIdFile || noRegFile;
        if (!anyMissing) return null;
        const missing: string[] = [];
        if (logoBlob || noLogoFile) missing.push('Institute logo');
        if (idBlob || noIdFile) missing.push('Government ID proof');
        if (regBlob || noRegFile) missing.push('Registration document');
        return (
          <div className="border border-wine/40 bg-wine/5 p-4 sm:p-5 flex items-start gap-3">
            <AlertCircle size={18} className="text-wine flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-display text-base text-cream-100">Documents incomplete</p>
              <p className="mt-1 text-sm text-cream-100/70 break-words">
                Missing or not yet uploaded to cloud storage:{' '}
                <span className="text-cream-100">{missing.join(', ')}</span>.
              </p>
              <p className="mt-1 text-xs text-cream-100/50 break-words">
                Approve will be rejected by the server. Use "Request Changes"
                to ask the applicant to re-upload.
              </p>
            </div>
          </div>
        );
      })()}

      <div className="border border-night-700 bg-night-900 p-4 sm:p-5 flex flex-wrap items-center gap-3">
        {canApprove && (
          <>
            <ActionButton onClick={handleApprove} disabled={processing} variant="primary" icon={CheckCircle2}>Approve</ActionButton>
            <ActionButton onClick={() => setModal('changes')} disabled={processing} variant="outline" icon={AlertCircle}>Request Changes</ActionButton>
            <ActionButton onClick={() => setModal('reject')} disabled={processing} variant="danger" icon={XCircle}>Reject</ActionButton>
          </>
        )}
        {canSuspend && (
          <ActionButton onClick={() => setModal('suspend')} disabled={processing} variant="danger" icon={ShieldOff}>Suspend</ActionButton>
        )}
        {!canApprove && !canSuspend && (
          <p className="text-sm text-cream-100/40">No actions available in current state ({status}).</p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 min-w-0">
        {/* Main column — all 14 steps */}
        <div className="xl:col-span-2 space-y-3 min-w-0">
          {/* Always-visible summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryStat label="Step" value={`${app.currentStep}/${TOTAL_STEPS}`} />
            <SummaryStat label="Completion" value={`${app.completionPercentage ?? 0}%`} />
            <SummaryStat label="Status" value={status} />
            <SummaryStat label="Submitted" value={app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : '—'} />
          </div>

          {/* The 4 most important steps always open */}
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
                {app.step1InstituteInfo.logoPreview.startsWith('blob:') ? (
                  <div className="border border-dashed border-wine/40 bg-wine/5 p-4 max-w-md text-sm">
                    <p className="text-cream-100/80">Logo not available in the admin view.</p>
                    <p className="text-xs text-cream-100/50 mt-1 break-words">
                      The applicant selected a logo but the upload did not
                      complete to cloud storage. Ask the applicant to
                      re-upload via "Request Changes".
                    </p>
                  </div>
                ) : (
                  <img
                    src={app.step1InstituteInfo.logoPreview}
                    alt="Logo"
                    className="h-20 w-20 object-cover border border-night-600"
                  />
                )}
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

          <ApplicationStepSection step={14} label={STEP_LABELS[13]} open>
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

          {/* Remaining steps — collapsed by default, "Show all" reveals them */}
          {!showAllSteps && (
            <button
              onClick={() => setShowAllSteps(true)}
              className="w-full border border-night-700 bg-night-900/40 px-5 py-4 text-sm text-cream-100/70 hover:text-gold-400 hover:border-gold-500/40 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronRight size={14} />
              Show remaining 10 steps
            </button>
          )}

          {showAllSteps && (
            <>
              <ApplicationStepSection step={2} label={STEP_LABELS[1]}>
                <DataGrid
                  items={[
                    ['Primary category', app.step2Category?.primaryCategory],
                    ['Subcategories', Array.isArray(app.step2Category?.subcategories) ? app.step2Category.subcategories.join(', ') : app.step2Category?.subcategories],
                  ]}
                />
              </ApplicationStepSection>

              <ApplicationStepSection step={4} label={STEP_LABELS[3]}>
                {Array.isArray(app.step4Courses?.courses) && app.step4Courses.courses.length > 0 ? (
                  <div className="space-y-3">
                    {app.step4Courses.courses.map((c: any, i: number) => (
                      <div key={i} className="border border-night-700 bg-night-800/50 p-3 text-sm">
                        <p className="text-cream-100">{c.courseName || `Course ${i + 1}`}</p>
                        <p className="text-xs text-cream-100/40 mt-1">
                          {c.duration && `${c.duration}`} {c.mode && `· ${c.mode}`} {c.level && `· ${c.level}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-cream-100/40">No courses listed.</p>}
              </ApplicationStepSection>

              <ApplicationStepSection step={5} label={STEP_LABELS[4]}>
                {Array.isArray(app.step5Batches?.batches) && app.step5Batches.batches.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {app.step5Batches.batches.map((b: any, i: number) => (
                      <p key={i} className="text-cream-100/80">{b.batchName || `Batch ${i + 1}`} — {b.startDate || '—'} → {b.endDate || '—'}</p>
                    ))}
                  </div>
                ) : <p className="text-sm text-cream-100/40">No batches listed.</p>}
              </ApplicationStepSection>

              <ApplicationStepSection step={6} label={STEP_LABELS[5]}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  {Object.entries(app.step6LearningExperience || {}).slice(0, 12).map(([k, v]) => (
                    v ? <div key={k} className="text-cream-100/70 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div> : null
                  ))}
                </div>
              </ApplicationStepSection>

              <ApplicationStepSection step={7} label={STEP_LABELS[6]}>
                <p className="text-sm text-cream-100/80 break-words">
                  {Array.isArray(app.step7Facilities?.facilities) ? app.step7Facilities.facilities.join(', ') : '—'}
                </p>
              </ApplicationStepSection>

              <ApplicationStepSection step={8} label={STEP_LABELS[7]}>
                <DataGrid
                  items={[
                    ['Total faculty', app.step8Faculty?.totalFaculty],
                    ['Student ratio', app.step8Faculty?.trainerStudentRatio],
                  ]}
                />
              </ApplicationStepSection>

              <ApplicationStepSection step={9} label={STEP_LABELS[8]}>
                <DataGrid
                  items={[
                    ['Course fee', app.step9Fees?.courseFee],
                    ['Total payable', app.step9Fees?.totalPayableAmount],
                    ['Scholarship available', app.step9Fees?.scholarshipAvailable ? 'Yes' : 'No'],
                    ['EMI available', app.step9Fees?.installmentAvailable ? 'Yes' : 'No'],
                  ]}
                />
              </ApplicationStepSection>

              <ApplicationStepSection step={10} label={STEP_LABELS[9]}>
                <DataGrid
                  items={[
                    ['Admission type', app.step10Admission?.admissionType],
                    ['Start date', app.step10Admission?.admissionStartDate],
                    ['End date', app.step10Admission?.admissionEndDate],
                    ['Contact', app.step10Admission?.admissionContactPerson],
                  ]}
                />
              </ApplicationStepSection>

              <ApplicationStepSection step={11} label={STEP_LABELS[10]}>
                <DataGrid
                  items={[
                    ['Placement assistance', app.step11Career?.placementAssistance ? 'Yes' : 'No'],
                    ['Avg package', app.step11Career?.averagePackage],
                    ['Highest package', app.step11Career?.highestPackage],
                    ['Placement rate', app.step11Career?.placementRate ? `${app.step11Career.placementRate}%` : null],
                  ]}
                />
              </ApplicationStepSection>

              <ApplicationStepSection step={12} label={STEP_LABELS[11]}>
                {Array.isArray(app.step12Results?.results) && app.step12Results.results.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {app.step12Results.results.map((r: any, i: number) => (
                      <p key={i} className="text-cream-100/80">{r.exam || `Result ${i + 1}`} — {r.year || ''}</p>
                    ))}
                  </div>
                ) : <p className="text-sm text-cream-100/40">No results listed.</p>}
              </ApplicationStepSection>

              <ApplicationStepSection step={13} label={STEP_LABELS[12]}>
                <DataGrid
                  items={[
                    ['Website', app.step13Gallery?.website, 'link'],
                    ['Instagram', app.step13Gallery?.instagram, 'link'],
                    ['Facebook', app.step13Gallery?.facebook, 'link'],
                    ['YouTube', app.step13Gallery?.youtube, 'link'],
                  ]}
                />
              </ApplicationStepSection>

              <button
                onClick={() => setShowAllSteps(false)}
                className="w-full border border-night-700 bg-night-900/40 px-5 py-3 text-sm text-cream-100/70 hover:text-gold-400 hover:border-gold-500/40 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={14} />
                Collapse remaining steps
              </button>
            </>
          )}
        </div>

        {/* Right column: applicant + history */}
        <div className="space-y-4 min-w-0">
          <div className="border border-night-700 bg-night-900 p-5 min-w-0">
            <p className="overline text-gold-400 mb-3">Applicant</p>
            {app.owner ? (
              <div className="space-y-1 text-sm min-w-0">
                <p className="text-cream-100 break-words">{app.owner.name}</p>
                <p className="text-cream-100/60 break-all text-xs flex items-center gap-1.5"><Mail size={11} className="flex-shrink-0" />{app.owner.email}</p>
                {app.owner.phone && <p className="text-cream-100/60 text-xs flex items-center gap-1.5"><Phone size={11} className="flex-shrink-0" />{app.owner.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-cream-100/40">Owner not populated</p>
            )}
          </div>

          <div className="border border-night-700 bg-night-900 p-5 min-w-0">
            <p className="overline text-gold-400 mb-3">Progress</p>
            <p className="font-display text-d4 text-cream-100">{app.completionPercentage ?? 0}%</p>
            <p className="text-xs text-cream-100/40 mt-1">Step {app.currentStep} of {TOTAL_STEPS}</p>
            <div className="h-px bg-night-700 mt-4 relative">
              <div className="absolute inset-y-0 left-0 bg-gold-500" style={{ width: `${app.completionPercentage ?? 0}%` }} />
            </div>
          </div>

          <div className="border border-night-700 bg-night-900 p-5 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <History size={12} className="text-gold-500/60 flex-shrink-0" />
              <p className="overline text-gold-400">Verification History</p>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-cream-100/30">No actions yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={i} className="border-l-2 border-night-600 pl-3 py-1">
                    <p className="text-xs text-cream-100/60 capitalize">{h.action} · {h.status}</p>
                    {h.adminName && <p className="text-xs text-cream-100/40">by {h.adminName}</p>}
                    {h.reason && <p className="text-xs text-cream-100/80 mt-1 break-words">{h.reason}</p>}
                    <p className="text-[10px] text-cream-100/30 mt-1">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals for actions */}
      <Modal
        open={modal === 'changes'}
        onClose={() => { setModal(null); setModalText(''); setError(null); }}
        title="Request Changes"
        size="md"
      >
        <p className="text-sm text-cream-100/60 mb-3">Tell the institute what they need to change. This feedback is visible to them.</p>
        <textarea
          value={modalText}
          onChange={(e) => setModalText(e.target.value)}
          placeholder="Describe what changes are needed…"
          rows={5}
          className="w-full bg-night-800 border border-night-600 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => { setModal(null); setModalText(''); setError(null); }} disabled={processing} className="px-4 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors">Cancel</button>
          <button onClick={handleChanges} disabled={processing} className="px-5 py-2 bg-gold-500 text-[10px] uppercase tracking-wide2 text-night-900 hover:bg-gold-400 transition-colors disabled:opacity-50">{processing ? 'Submitting…' : 'Send Feedback'}</button>
        </div>
      </Modal>

      <Modal
        open={modal === 'reject'}
        onClose={() => { setModal(null); setModalText(''); setError(null); }}
        title="Reject Application"
        size="md"
      >
        <p className="text-sm text-cream-100/60 mb-3">State the reason for rejection. This is recorded in the verification history.</p>
        <textarea
          value={modalText}
          onChange={(e) => setModalText(e.target.value)}
          placeholder="Reason for rejection…"
          rows={5}
          className="w-full bg-night-800 border border-night-600 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => { setModal(null); setModalText(''); setError(null); }} disabled={processing} className="px-4 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors">Cancel</button>
          <button onClick={handleReject} disabled={processing} className="px-5 py-2 bg-red-500 text-[10px] uppercase tracking-wide2 text-white hover:bg-red-400 transition-colors disabled:opacity-50">{processing ? 'Submitting…' : 'Reject'}</button>
        </div>
      </Modal>

      <Modal
        open={modal === 'suspend'}
        onClose={() => { setModal(null); setModalText(''); setError(null); }}
        title="Suspend Verified Institute"
        size="md"
      >
        <p className="text-sm text-cream-100/60 mb-3">Suspending will hide the institute from public listings. State the reason.</p>
        <textarea
          value={modalText}
          onChange={(e) => setModalText(e.target.value)}
          placeholder="Reason for suspension…"
          rows={5}
          className="w-full bg-night-800 border border-night-600 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/30 focus:border-gold-500 focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => { setModal(null); setModalText(''); setError(null); }} disabled={processing} className="px-4 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors">Cancel</button>
          <button onClick={handleSuspend} disabled={processing} className="px-5 py-2 bg-red-500 text-[10px] uppercase tracking-wide2 text-white hover:bg-red-400 transition-colors disabled:opacity-50">{processing ? 'Submitting…' : 'Suspend'}</button>
        </div>
      </Modal>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="border border-night-700 bg-night-900 p-4 min-w-0">
      <p className="overline text-cream-100/40 mb-1 truncate">{label}</p>
      <p className="text-sm text-cream-100 font-medium break-words capitalize">{value ?? '—'}</p>
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
    <div className="border border-night-700 bg-night-900 min-w-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="overline text-gold-400">Step {String(step).padStart(2, '0')}</p>
          <p className="font-display text-base text-cream-100 mt-1 truncate">{label}</p>
        </div>
        <ChevronRight size={14} className={`text-cream-100/40 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 sm:px-5 pb-5 border-t border-night-700 pt-4 min-w-0">{children}</div>}
    </div>
  );
}

function DataGrid({ items }: { items: Array<[string, any, 'link'?] | [string, any]> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm min-w-0">
      {items.map(([label, value, type], i) => {
        if (!value) return null;
        return (
          <div key={i} className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40 mb-1">{label}</p>
            {type === 'link' ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 underline break-all inline-flex items-center gap-1"
              >
                <span className="break-all">{String(value)}</span>
                <ExternalLink size={10} className="flex-shrink-0" />
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
  const isBlob = typeof url === 'string' && url.startsWith('blob:');
  const looksLikeImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || isBlob;

  return (
    <div className="min-w-0">
      <p className="overline text-cream-100/40 mb-2">{label}</p>
      {isBlob ? (
        <div className="border border-dashed border-wine/40 bg-wine/5 p-4 text-sm">
          <p className="text-cream-100/80 break-words">
            Document not available in the admin view.
          </p>
          <p className="text-xs text-cream-100/50 mt-1 break-words">
            The applicant uploaded this file but the upload did not complete to
            cloud storage. Ask the applicant to re-upload via "Request Changes".
          </p>
        </div>
      ) : looksLikeImage ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={url}
            alt={label}
            className="max-h-48 w-auto max-w-full border border-night-600"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </a>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 underline break-all"
        >
          <FileText size={14} className="flex-shrink-0" />
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

/* ============================================================
 * Hostel Approvals + All Hostels
 * ============================================================ */

function HostelApprovalsView({ onError }: { onError: (e: Error) => never }) {
  return <HostelListView title="Pending Hostel Approvals" subtitle="Review and approve or reject new hostel listings." fixedStatus="pending" onError={onError} />;
}

function AllHostelsView({ onError }: { onError: (e: Error) => never }) {
  return <HostelListView title="All Hostels" subtitle="Manage the status of every hostel on the platform." onError={onError} />;
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
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} onRetry={load} />}

      <PageHeader
        title={title}
        subtitle={subtitle}
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
      />

      {!fixedStatus && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-4 py-2 text-[10px] uppercase tracking-wide2 transition-colors ${
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
        <EmptyState title="No hostels found" hint="No hostels match the current filter." />
      ) : (
        <div className="space-y-3 min-w-0">
          {hostels.map((h) => (
            <div key={h._id} className="border border-night-700 bg-night-900 p-4 sm:p-5 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-cream-100 break-words">
                    {h.masked_name || h.name}
                  </h3>
                  <p className="text-sm text-cream-100/60 mt-1 break-words">
                    {h.hostel_type}
                    {h.address?.area && ` · ${h.address.area}`}
                    {h.address?.city && `, ${h.address.city}`}
                    {h.address?.state && `, ${h.address.state}`}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-100/40 mt-2">
                    {h.address?.pincode && <span className="flex items-center gap-1"><MapPin size={10} />{h.address.pincode}</span>}
                    {h.total_hostel_beds != null && <span>{h.total_hostel_beds} beds</span>}
                    {h.owner?.name && <span>by {h.owner.name}</span>}
                    <span>Added {new Date(h.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
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
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); load(searchInput); };

  if (loading) return <CenteredSpinner label="Loading owners" />;

  return (
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} onRetry={() => load(search)} />}

      <PageHeader
        title={title}
        subtitle={subtitle}
        onRefresh={() => { setRefreshing(true); load(search); }}
        refreshing={refreshing}
      />

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <div className="relative flex-1 min-w-0">
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
          className="px-5 py-2 border border-gold-500/50 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors flex-shrink-0"
        >
          Search
        </button>
      </form>

      {owners.length === 0 ? (
        <EmptyState title="No owners found" hint="No owners match the current filter." />
      ) : (
        <div className="border border-night-700 bg-night-900 divide-y divide-night-700 min-w-0">
          {owners.map((o: any) => (
            <div key={o._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-base text-cream-100 break-words">{o.name}</p>
                <p className="text-sm text-cream-100/60 mt-1 break-words">{o.email}{o.phone ? ` · ${o.phone}` : ''}</p>
                {o.hostels && o.hostels.length > 0 && (
                  <p className="text-xs text-cream-100/40 mt-2">{o.hostels.length} hostel(s)</p>
                )}
                {o.institutes && o.institutes.length > 0 && (
                  <p className="text-xs text-cream-100/40 mt-2">{o.institutes.length} institute(s)</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-cream-100/40">Joined {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                {o.status && <StatusBadge status={o.status} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Registered Students (NEW — full table with real backend data)
 * ============================================================ */

function StudentsView({ onError }: { onError: (e: Error) => never }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ current_page: 1, total_pages: 1, total_results: 0, per_page: 20 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (page = 1) => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await get(`/admin/students?${params.toString()}`);
      setStudents(data?.data?.students || []);
      setPagination(data?.data?.pagination || { current_page: 1, total_pages: 1, total_results: 0, per_page: 20 });
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load students'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status, onError]);

  useEffect(() => { load(1); }, [load]);

  const openDetail = async (s: Student) => {
    setSelected(s);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await get(`/admin/students/${s._id}`);
      setDetail(data?.data || s);
    } catch (err: any) {
      setDetail(s);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setSelected(null); setDetail(null); };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };

  if (loading) return <CenteredSpinner label="Loading students" />;

  return (
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} onRetry={() => load(pagination.current_page)} />}

      <PageHeader
        title="Registered Students"
        subtitle="All students registered on EasyToFindEdu. Click a row to see full profile."
        onRefresh={() => { setRefreshing(true); load(pagination.current_page); }}
        refreshing={refreshing}
      />

      {/* Filter bar */}
      <div className="border border-night-700 bg-night-900 p-4 flex flex-col lg:flex-row gap-3 min-w-0">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
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
            className="px-5 py-2 border border-gold-500/50 text-[10px] uppercase tracking-wide2 text-gold-400 hover:bg-gold-500 hover:text-night-900 transition-colors flex-shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0 flex-shrink-0">
          {['', 'verified', 'pending', 'blocked'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
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

      {/* Table — wrapped in overflow-x-auto so it scrolls on narrow screens */}
      {students.length === 0 ? (
        <EmptyState title="No students found" hint="Try adjusting your search or status filter." />
      ) : (
        <div className="border border-night-700 bg-night-900 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-night-800 border-b border-night-700">
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Qualification</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-700">
                {students.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => openDetail(s)}
                    className="hover:bg-night-800/50 cursor-pointer transition-colors"
                  >
                    <Td>
                      <span className="text-cream-100 break-words">{s.name}</span>
                    </Td>
                    <Td>
                      <span className="text-cream-100/70 break-all text-xs">{s.email}</span>
                    </Td>
                    <Td>
                      <span className="text-cream-100/70 text-xs">{s.phone || '—'}</span>
                    </Td>
                    <Td>
                      <span className="text-cream-100/70 text-xs">{s.lastQualification || '—'}</span>
                    </Td>
                    <Td>
                      <StatusBadge status={s.status} />
                    </Td>
                    <Td>
                      <span className="text-cream-100/60 text-xs whitespace-nowrap">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                    </Td>
                    <Td className="text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDetail(s); }}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide2 text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        <Eye size={11} />
                        View
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            disabled={pagination.current_page <= 1}
            onClick={() => load(pagination.current_page - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-xs text-cream-100/50">
            Page {pagination.current_page} of {pagination.total_pages} · {pagination.total_results} total
          </span>
          <button
            disabled={pagination.current_page >= pagination.total_pages}
            onClick={() => load(pagination.current_page + 1)}
            className="inline-flex items-center gap-1 px-3 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-30"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Student detail modal — fetches full record, internal scroll */}
      <Modal open={!!selected} onClose={closeDetail} title={selected?.name || 'Student'} size="lg">
        {detailLoading ? (
          <CenteredSpinner label="Loading student" />
        ) : detail ? (
          <StudentDetail student={detail} />
        ) : (
          <p className="text-sm text-cream-100/40">No data.</p>
        )}
      </Modal>
    </div>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-4 py-3 text-[10px] uppercase tracking-wide2 text-cream-100/50 font-medium ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 align-middle min-w-0 ${className}`}>
      <div className="min-w-0">{children}</div>
    </td>
  );
}

function StudentDetail({ student }: { student: any }) {
  const rows: Array<[string, any, 'link'?, any?]> = [
    ['Email', student.email, 'link', Mail],
    ['Phone', student.phone, undefined, Phone],
    ['Gender', student.gender ? student.gender[0].toUpperCase() + student.gender.slice(1) : null],
    ['Status', student.status],
    ['Last qualification', student.lastQualification],
    ['City', student.city],
    ['State', student.state],
    ['Auth provider', student.authProvider],
    ['Referral code', student.referralCode],
    ['Joined', student.createdAt ? new Date(student.createdAt).toLocaleString('en-IN') : null, undefined, CalendarDays],
  ];
  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-start gap-4 pb-4 border-b border-night-700">
        {student.profilePhoto?.url ? (
          <img
            src={student.profilePhoto.url}
            alt={student.name}
            className="h-16 w-16 rounded-full object-cover border border-night-600 flex-shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-full border border-night-600 flex items-center justify-center flex-shrink-0 bg-night-800">
            <span className="font-display text-xl text-gold-500">
              {(student.name?.[0] || '?').toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-xl text-cream-100 break-words">{student.name}</h4>
          <p className="text-sm text-cream-100/50 mt-1 break-all">{student.email}</p>
          <div className="mt-2">
            <StatusBadge status={student.status} />
          </div>
        </div>
      </div>

      <div>
        <p className="overline text-gold-400 mb-3">Profile</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm min-w-0">
          {rows.map(([label, value, type, Icon], i) => {
            if (value == null || value === '') return null;
            return (
              <div key={i} className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40 mb-1 flex items-center gap-1.5">
                  {Icon ? <Icon size={10} className="flex-shrink-0" /> : null}
                  {label}
                </p>
                {type === 'link' ? (
                  <a href={`mailto:${value}`} className="text-gold-400 hover:text-gold-300 underline break-all text-xs">{String(value)}</a>
                ) : (
                  <p className="text-cream-100 break-words capitalize">{String(value)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {student.careerGuidance && (
        <div>
          <p className="overline text-gold-400 mb-3">Career Guidance</p>
          <div className="border border-night-700 bg-night-800/40 p-3 text-sm space-y-1 min-w-0">
            {student.careerGuidance.stream && (
              <p className="text-cream-100 break-words"><span className="text-cream-100/40">Stream: </span>{student.careerGuidance.stream}</p>
            )}
            {student.careerGuidance.isQuestionnaireCompleted !== undefined && (
              <p className="text-cream-100/60 text-xs">
                Questionnaire: {student.careerGuidance.isQuestionnaireCompleted ? 'Completed' : 'Not completed'}
              </p>
            )}
            {Array.isArray(student.careerGuidance.savedPaths) && student.careerGuidance.savedPaths.length > 0 && (
              <p className="text-cream-100/60 text-xs">{student.careerGuidance.savedPaths.length} saved career path(s)</p>
            )}
          </div>
        </div>
      )}

      <div className="text-[10px] text-cream-100/30 flex items-center gap-1.5">
        <Hash size={10} />
        ID: <span className="font-mono break-all">{student._id}</span>
      </div>
    </div>
  );
}

/* ============================================================
 * Analytics
 * ============================================================ */

function AnalyticsView({ onError }: { onError: (e: Error) => never }) {
  const [overview, setOverview] = useState<any>(null);
  const [hostelStats, setHostelStats] = useState<any>(null);
  const [appStats, setAppStats] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [a, b, c, s] = await Promise.allSettled([
        get('/admin/dashboard/overview'),
        get('/admin/hostels/dashboard'),
        get('/institute-applications/stats', APP_API_BASE),
        get('/admin/students/stats/summary'),
      ]);
      if (a.status === 'fulfilled') setOverview(a.value?.data ?? null);
      if (b.status === 'fulfilled') setHostelStats(b.value?.data ?? null);
      if (c.status === 'fulfilled') setAppStats(c.value?.data ?? null);
      if (s.status === 'fulfilled') setStudentStats(s.value?.data ?? null);
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
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} onRetry={load} />}

      <PageHeader
        title="Analytics & Insights"
        subtitle="Aggregated platform metrics from the live database."
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-w-0">
        <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
          <p className="overline text-gold-400 mb-4">Platform Counts</p>
          <div className="space-y-3">
            <Stat label="Students (total)" value={studentStats?.total ?? counts.students ?? 0} />
            <Stat label="Students verified" value={studentStats?.verified ?? 0} />
            <Stat label="Hostels" value={counts.hostels ?? 0} />
            <Stat label="Institutes" value={counts.institutes ?? 0} />
            <Stat label="Hostel Owners" value={counts.hostelOwners ?? 0} />
            <Stat label="Institute Owners" value={counts.instituteOwners ?? 0} />
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
          <p className="overline text-gold-400 mb-4">Hostel Activity</p>
          <div className="space-y-3">
            <Stat label="Total" value={hostelStats?.totalHostels ?? 0} />
            <Stat label="Pending" value={hostelStats?.pendingHostels ?? 0} />
            <Stat label="Approved" value={hostelStats?.approvedHostels ?? 0} />
            <Stat label="Rejected" value={hostelStats?.rejectedHostels ?? 0} />
            <Stat label="Total Bookings" value={hostelStats?.totalBookings ?? 0} />
            <Stat label="Total Reviews" value={hostelStats?.totalReviews ?? 0} />
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
          <p className="overline text-gold-400 mb-4">Institute Applications</p>
          <div className="space-y-3">
            <Stat label="Total" value={appStats?.total ?? 0} />
            <Stat label="Submitted" value={appStats?.submitted ?? 0} />
            <Stat label="Changes Requested" value={appStats?.changes_requested ?? 0} />
            <Stat label="Verified" value={appStats?.verified ?? 0} />
            <Stat label="Rejected" value={appStats?.rejected ?? 0} />
          </div>
        </div>

        <div className="border border-night-700 bg-night-900 p-5 sm:p-6 min-w-0">
          <p className="overline text-gold-400 mb-4">Growth (Last 6 months)</p>
          <div className="space-y-4">
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
    <div className="flex items-center justify-between text-sm gap-3">
      <span className="text-cream-100/60 truncate">{label}</span>
      <span className="font-display text-cream-100 flex-shrink-0">{value}</span>
    </div>
  );
}

function GrowthBlock({ title, data }: { title: string; data: Array<{ _id: number; count: number }> }) {
  const total = data.reduce((sum, m) => sum + m.count, 0);
  return (
    <div>
      <div className="flex items-center justify-between text-sm gap-3">
        <span className="text-cream-100/60 truncate">{title}</span>
        <span className="font-display text-cream-100 flex-shrink-0">{total}</span>
      </div>
      <div className="flex items-end gap-1 mt-2 h-8 min-w-0">
        {Array.from({ length: 6 }, (_, i) => {
          const m = data.find((d) => d._id === i + 1);
          const h = m ? Math.max(2, Math.round((m.count / Math.max(1, total)) * 32)) : 2;
          return <div key={i} className="flex-1 min-w-[8px] bg-gold-500/40" style={{ height: h }} title={`${m?.count ?? 0}`} />;
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * College Applications — list
 * ============================================================ */

function CollegeApplicationsView({
  onOpen,
  onError,
}: {
  onOpen: (id: string) => void;
  onError: (e: Error) => never;
}) {
  const [apps, setApps] = useState<CollegeApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ current_page: 1, total_pages: 1, total_results: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async (page = 1) => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await get(`/college-applications?${params.toString()}`, APP_API_BASE);
      setApps(data?.data?.applications || []);
      setPagination(data?.data?.pagination || { current_page: 1, total_pages: 1, total_results: 0, per_page: 10 });
    } catch (err: any) {
      try { onError(err); } catch { setError(err?.message || 'Failed to load applications'); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status, onError]);

  useEffect(() => { load(1); }, [load]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };

  if (loading) return <CenteredSpinner label="Loading applications" />;

  return (
    <div className="space-y-6 min-w-0">
      {error && <ErrorState message={error} onRetry={() => load(pagination.current_page)} />}

      <PageHeader
        title="College Applications"
        subtitle="Review, approve, reject, or request changes to college registration applications."
        onRefresh={() => { setRefreshing(true); load(pagination.current_page); }}
        refreshing={refreshing}
      />

      {/* Filters */}
      <div className="border border-night-700 bg-night-900 p-4 flex flex-col lg:flex-row gap-3 min-w-0">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search college, city, state…"
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
          {['', 'submitted', 'under_review', 'changes_requested', 'verified', 'rejected'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`flex-shrink-0 px-3 py-2 text-[10px] uppercase tracking-wide2 transition-colors whitespace-nowrap ${
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

      {apps.length === 0 ? (
        <EmptyState title="No applications found" hint="Try adjusting your filters." />
      ) : (
        <div className="space-y-3 min-w-0">
          {apps.map((a) => (
            <div
              key={a._id}
              className="border border-night-700 bg-night-900 p-4 sm:p-5 hover:border-gold-500/40 transition-colors min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-cream-100 break-words">
                    {a.step1BasicInfo?.collegeName || 'Untitled College'}
                  </h3>
                  <p className="text-sm text-cream-100/60 mt-1 break-words">
                    {a.step2Location?.city ? `${a.step2Location.city}${a.step2Location.state ? `, ${a.step2Location.state}` : ''}` : 'Location not provided'}
                    {a.owner?.name && ` · by ${a.owner.name}`}
                  </p>
                  <p className="text-xs text-cream-100/40 mt-2">
                    Submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}
                    {' · '}
                    Step {a.currentStep}/12 · {a.completionPercentage}%
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
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

      {pagination.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            disabled={pagination.current_page <= 1}
            onClick={() => load(pagination.current_page - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-xs text-cream-100/50">
            Page {pagination.current_page} of {pagination.total_pages} · {pagination.total_results} total
          </span>
          <button
            disabled={pagination.current_page >= pagination.total_pages}
            onClick={() => load(pagination.current_page + 1)}
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
 * College Application Review
 * ============================================================ */

function CollegeReviewView({
  applicationId,
  onBack,
  onError,
}: {
  applicationId: string;
  onBack: () => void;
  onError: (e: Error) => never;
}) {
  const [app, setApp] = useState<CollegeApplication | null>(null);
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
        get(`/college-applications/${applicationId}`, APP_API_BASE),
        get(`/college-applications/${applicationId}/history`, APP_API_BASE),
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
      await patch(`/college-applications/${app._id}/${action}`, body || {}, APP_API_BASE);
      await load();
      setModal(null);
      setModalText('');
    } catch (err: any) {
      setError(err?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = () => {
    if (!confirm('Approve this college application? A College record will be created and the listing will be live.')) return;
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
  if (!app) return <EmptyState title="Application not found" hint="It may have been deleted." />;

  const status = app.verificationStatus || app.status;
  const canApprove = status === 'submitted' || status === 'changes_requested' || status === 'under_review';
  const canReject = status !== 'verified' && status !== 'rejected';
  const canSuspend = status === 'verified';
  const canRequestChanges = status !== 'verified' && status !== 'rejected';

  const s1: any = app.step1BasicInfo || {};
  const s2: any = app.step2Location || {};
  const s3: any = app.step3Affiliation || {};
  const s4: any = app.step4Courses || {};
  const s5: any = app.step5AdmissionFees || {};
  const s6: any = app.step6Facilities || {};
  const s7: any = app.step7Hostel || {};
  const s8: any = app.step8Placements || {};
  const s9: any = app.step9Scholarships || {};
  const s10: any = app.step10Gallery || {};
  const s11: any = app.step11Documents || {};

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title={s1.collegeName || 'College Application'}
        subtitle={`Owner: ${app.owner?.name || 'Unknown'}${app.owner?.email ? ` · ${app.owner.email}` : ''}`}
        onRefresh={() => { setRefreshing(true); load(); }}
        refreshing={refreshing}
        actions={
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 border border-night-600 px-4 py-2 text-[10px] uppercase tracking-wide2 text-cream-100/70 hover:border-gold-500 hover:text-gold-400 transition-colors"
          >
            <ChevronLeft size={12} /> Back
          </button>
        }
      />

      {error && (
        <div className="border-l-2 border-wine bg-wine/10 px-5 py-3 text-sm text-cream-100/80">
          {error}
        </div>
      )}

      {/* Status + actions */}
      <div className="border border-night-700 bg-night-900 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={status} />
          <span className="text-sm text-cream-100/60">
            Step {app.currentStep}/12 · {app.completionPercentage}% complete
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={processing}
              className="inline-flex items-center gap-2 border border-green-500/50 px-4 py-2 text-[10px] uppercase tracking-wide2 text-green-300 hover:bg-green-500 hover:text-night-900 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={12} /> Approve
            </button>
          )}
          {canRequestChanges && (
            <button
              onClick={() => setModal('changes')}
              disabled={processing}
              className="inline-flex items-center gap-2 border border-amber-500/50 px-4 py-2 text-[10px] uppercase tracking-wide2 text-amber-300 hover:bg-amber-500 hover:text-night-900 transition-colors disabled:opacity-50"
            >
              <AlertCircle size={12} /> Request Changes
            </button>
          )}
          {canReject && (
            <button
              onClick={() => setModal('reject')}
              disabled={processing}
              className="inline-flex items-center gap-2 border border-red-500/50 px-4 py-2 text-[10px] uppercase tracking-wide2 text-red-300 hover:bg-red-500 hover:text-night-900 transition-colors disabled:opacity-50"
            >
              <XCircle size={12} /> Reject
            </button>
          )}
          {canSuspend && (
            <button
              onClick={() => setModal('suspend')}
              disabled={processing}
              className="inline-flex items-center gap-2 border border-orange-500/50 px-4 py-2 text-[10px] uppercase tracking-wide2 text-orange-300 hover:bg-orange-500 hover:text-night-900 transition-colors disabled:opacity-50"
            >
              <ShieldOff size={12} /> Suspend
            </button>
          )}
        </div>
      </div>

      {/* Admin feedback banners */}
      {status === 'changes_requested' && app.adminFeedback && (
        <div className="border border-amber-500/40 bg-amber-500/5 p-5">
          <p className="overline text-amber-300 mb-2">Changes requested</p>
          <p className="text-cream-100/80">{app.adminFeedback}</p>
        </div>
      )}
      {status === 'rejected' && (
        <div className="border border-red-500/40 bg-red-500/5 p-5">
          <p className="overline text-red-300 mb-2">Application rejected</p>
          <p className="text-cream-100/80">{app.rejectionReason || 'No reason provided.'}</p>
        </div>
      )}

      {/* Sections */}
      <Section title="College Basic Information">
        <Field label="College Name" value={s1.collegeName} />
        <Field label="Short Name" value={s1.shortName} />
        <Field label="Institution Type" value={s1.institutionType} />
        <Field label="Ownership" value={s1.ownershipType} />
        <Field label="Established" value={s1.establishedYear} />
        <Field label="About" value={s1.about} />
        <Field label="Website" value={s1.website} />
        <Field label="Contact Email" value={s1.contactEmail} />
        <Field label="Contact Phone" value={s1.contactPhone} />
        {s1.logoFile && (
          <div className="pt-3">
            <span className="overline text-gold-400">Logo</span>
            <img src={s1.logoFile} alt="Logo" className="mt-2 w-32 h-32 object-cover border border-night-700" />
          </div>
        )}
      </Section>

      <Section title="Location & Campus">
        <Field label="Full Address" value={s2.fullAddress} />
        <Field label="City" value={s2.city} />
        <Field label="State" value={s2.state} />
        <Field label="District" value={s2.district} />
        <Field label="PIN Code" value={s2.pincode} />
        <Field label="Google Maps" value={s2.googleMapsLink} />
      </Section>

      <Section title="Affiliation & Recognition">
        <Field label="Affiliated University" value={s3?.affiliatedUniversity} />
        <Field label="NAAC Grade" value={s3?.accreditationGrade} />
        <Field label="NIRF Rank" value={s3?.nirfRank} />
        <Field label="UGC / AICTE / NAAC / NBA" value={[
          s3?.ugcRecognized && 'UGC',
          s3?.aicteApproved && 'AICTE',
          s3?.naacAccredited && 'NAAC',
          s3?.nbaAccredited && 'NBA',
        ].filter(Boolean).join(', ') || '—'} />
      </Section>

      <Section title={`Courses (${(s4?.courses || []).length})`}>
        {(s4?.courses || []).length === 0 ? (
          <p className="text-sm text-cream-100/60">No courses added.</p>
        ) : (
          <div className="space-y-2">
            {(s4?.courses || []).map((c: any, i: number) => (
              <div key={i} className="border border-night-700 p-3 text-sm">
                <div className="font-medium text-cream-100">{c.courseName}</div>
                <div className="text-cream-100/60 text-xs">
                  {[c.degree, c.stream, c.specialization, c.duration, c.eligibility, c.admissionMode, c.entranceExam, c.intakeSeats && `${c.intakeSeats} seats`, c.courseFee && `₹${c.courseFee}/yr`].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Admission & Fees">
        <Field label="Admission Process" value={s5?.admissionProcess} />
        <Field label="Entrance Exams" value={s5?.entranceExams} />
        <Field label="Eligibility" value={s5?.eligibilityRequirements} />
        <Field label="Fee Structure" value={s5?.feeStructureNote} />
      </Section>

      <Section title="Facilities">
        <Field label="Selected" value={[
          s6?.library && 'Library',
          s6?.laboratories && 'Laboratories',
          s6?.sportsFacilities && 'Sports',
          s6?.cafeteria && 'Cafeteria',
          s6?.auditorium && 'Auditorium',
          s6?.medicalFacilities && 'Medical',
          s6?.wifi && 'Wi-Fi',
          s6?.transportation && 'Transportation',
          s6?.clubsActivities && 'Clubs',
        ].filter(Boolean).join(', ') || '—'} />
        {s6?.otherFacilities && <Field label="Other" value={s6.otherFacilities} />}
      </Section>

      <Section title="Hostel">
        <Field label="Available" value={s7?.isAvailable ? 'Yes' : 'No'} />
        {s7?.isAvailable && (
          <>
            <Field label="Boys / Girls" value={[s7?.boysHostel && 'Boys', s7?.girlsHostel && 'Girls'].filter(Boolean).join(', ')} />
            <Field label="Capacity" value={s7?.totalCapacity} />
            <Field label="Monthly Fee" value={s7?.hostelFees} />
            <Field label="Room Types" value={s7?.roomTypes} />
            <Field label="Facilities" value={s7?.hostelFacilities} />
            <Field label="Rules" value={s7?.hostelRules} />
          </>
        )}
      </Section>

      <Section title="Placements">
        <Field label="Average Package" value={s8?.averagePackage ? `${s8.averagePackage} LPA` : ''} />
        <Field label="Highest Package" value={s8?.highestPackage ? `${s8.highestPackage} LPA` : ''} />
        <Field label="Placement Rate" value={s8?.placementRate ? `${s8.placementRate}%` : ''} />
        <Field label="Top Recruiters" value={s8?.topRecruiters} />
        <Field label="Internship" value={s8?.internshipOpportunities ? 'Available' : 'Not available'} />
      </Section>

      <Section title={`Scholarships (${(s9?.scholarships || []).length})`}>
        {(s9?.scholarships || []).length === 0 ? (
          <p className="text-sm text-cream-100/60">No scholarships added.</p>
        ) : (
          <div className="space-y-2">
            {(s9?.scholarships || []).map((s: any, i: number) => (
              <div key={i} className="border border-night-700 p-3 text-sm">
                <div className="font-medium text-cream-100">{s.name}</div>
                <div className="text-cream-100/60 text-xs">
                  {[s.eligibility, s.amount, s.deadline].filter(Boolean).join(' · ')}
                </div>
                {s.description && <p className="text-cream-100/80 mt-2">{s.description}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Gallery (${(s10?.galleryFiles || []).length} images)`}>
        {(s10?.galleryFiles || []).length === 0 ? (
          <p className="text-sm text-cream-100/60">No images.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {(s10?.galleryFiles || []).map((src: string, i: number) => (
              <a href={src} key={i} target="_blank" rel="noreferrer">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-24 object-cover border border-night-700 hover:border-gold-500/40" />
              </a>
            ))}
          </div>
        )}
        {s10?.videoUrl && <Field label="Video URL" value={s10.videoUrl} />}
      </Section>

      <Section title={`Documents (${(s11?.documents || []).length})`}>
        {(s11?.documents || []).length === 0 ? (
          <p className="text-sm text-cream-100/60">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {(s11?.documents || []).map((d: any, i: number) => (
              <div key={i} className="border border-night-700 p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-medium text-cream-100">{d.documentName}</div>
                  <div className="text-cream-100/60 text-xs">{d.category} · status: {d.status}</div>
                </div>
                {d.documentFile && (
                  <a href={d.documentFile} target="_blank" rel="noreferrer" className="text-gold-400 text-xs uppercase tracking-wide2 hover:underline">
                    View file →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Verification history */}
      <Section title="Verification History">
        {history.length === 0 ? (
          <p className="text-sm text-cream-100/60">No history entries yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h: any, i: number) => (
              <div key={i} className="border border-night-700 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-cream-100">{h.action || h.status}</span>
                  {h.adminName && <span className="text-cream-100/60">by {h.adminName}</span>}
                </div>
                <div className="text-cream-100/50 text-xs mt-1">
                  {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
                </div>
                {h.reason && <p className="text-cream-100/80 mt-2">{h.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Modals for request-changes / reject / suspend */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/80 backdrop-blur-sm p-4">
          <div className="bg-night-900 border border-night-700 max-w-md w-full p-6">
            <h3 className="font-display text-xl text-cream-100 mb-3">
              {modal === 'changes' && 'Request Changes'}
              {modal === 'reject' && 'Reject Application'}
              {modal === 'suspend' && 'Suspend College'}
            </h3>
            <p className="text-sm text-cream-100/60 mb-4">
              {modal === 'changes' && 'Tell the owner what they need to fix. They will be able to update and resubmit.'}
              {modal === 'reject' && 'Provide a rejection reason. This will be visible to the owner.'}
              {modal === 'suspend' && 'Provide a suspension reason. The college will be hidden from the public site.'}
            </p>
            <textarea
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              rows={4}
              placeholder="Type your message…"
              className="w-full bg-night-800 border border-night-600 p-3 text-sm text-cream-100 focus:border-gold-500 focus:outline-none"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => { setModal(null); setModalText(''); }}
                className="px-4 py-2 border border-night-600 text-xs text-cream-100/70 hover:border-gold-500 hover:text-gold-400"
              >
                Cancel
              </button>
              <button
                onClick={modal === 'changes' ? handleChanges : modal === 'reject' ? handleReject : handleSuspend}
                disabled={!modalText.trim() || processing}
                className="px-4 py-2 bg-gold-500 text-night-900 text-xs uppercase tracking-wide2 font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {modal === 'changes' && 'Send Request'}
                {modal === 'reject' && 'Reject'}
                {modal === 'suspend' && 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-night-700 bg-night-900 p-5">
      <h2 className="font-display text-xl text-cream-100 mb-4">{title}</h2>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return (
    <div className="grid grid-cols-3 gap-3 border-b border-night-800 py-1.5">
      <span className="text-cream-100/50 text-xs uppercase tracking-overline">{label}</span>
      <span className="col-span-2 text-cream-100/40 text-xs italic">— not provided —</span>
    </div>
  );
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-night-800 py-1.5">
      <span className="text-cream-100/50 text-xs uppercase tracking-overline">{label}</span>
      <span className="col-span-2 text-cream-100/90 break-words">{value}</span>
    </div>
  );
}
