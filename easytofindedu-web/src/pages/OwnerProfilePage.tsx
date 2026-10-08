import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  School,
  Plus,
  FileText,
  Edit2,
  ShieldCheck,
  LogOut,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cx } from '../lib/format';
import {
  fetchMyHostels,
  fetchInstituteDraftStatus,
  fetchInstituteDashboardStats,
  fetchCollegeDraftStatus,
  type HostelListItem,
  type InstituteDraftStatus,
  type InstituteDashboardStats,
} from '../services/ownerProfile.service';

type OwnerKind = 'hostel' | 'institute' | 'college';

const OWNER_META: Record<OwnerKind, {
  title: string;
  label: string;
  icon: any;
  color: string;
  dashboardPath: string;
  registerPath: string;
  listLabel: string;
  registerLabel: string;
  draftLabel: string;
  verificationLabel: string;
  primary: string;
}> = {
  hostel: {
    title: 'Hostel Owner',
    label: 'Hostel',
    icon: Home,
    color: 'text-amber-700',
    dashboardPath: '/hostel-dashboard',
    registerPath: '/hostels/add',
    listLabel: 'My Hostels',
    registerLabel: 'Register New Hostel',
    draftLabel: 'Hostel Drafts',
    verificationLabel: 'Hostel Verification',
    primary: 'hostels',
  },
  institute: {
    title: 'Institute Owner',
    label: 'Institute',
    icon: School,
    color: 'text-emerald-700',
    dashboardPath: '/institute-dashboard',
    registerPath: '/institute-registration',
    listLabel: 'My Institutes',
    registerLabel: 'Register New Institute',
    draftLabel: 'Institute Drafts',
    verificationLabel: 'Institute Verification',
    primary: 'institutes',
  },
  college: {
    title: 'College Owner',
    label: 'College',
    icon: GraduationCap,
    color: 'text-blue-700',
    dashboardPath: '/college-dashboard',
    registerPath: '/college-registration',
    listLabel: 'My Colleges',
    registerLabel: 'Register New College',
    draftLabel: 'College Drafts',
    verificationLabel: 'College Verification',
    primary: 'colleges',
  },
};

function statusColor(status: string | undefined): string {
  if (!status) return 'border-cream-300 bg-cream-100 text-ink-600';
  const s = status.toLowerCase();
  if (s.includes('approve') || s.includes('verified') || s.includes('publish')) {
    return 'border-green-400/40 bg-green-50 text-green-700';
  }
  if (s.includes('reject') || s.includes('suspend') || s.includes('block')) {
    return 'border-red-400/40 bg-red-50 text-red-700';
  }
  if (s.includes('review') || s.includes('submit') || s.includes('resubmit') || s.includes('progress')) {
    return 'border-blue-400/40 bg-blue-50 text-blue-700';
  }
  if (s.includes('change')) {
    return 'border-amber-400/40 bg-amber-50 text-amber-700';
  }
  // draft
  return 'border-night-700/30 bg-cream-200 text-ink-700';
}

function statusLabel(status: string | undefined): string {
  if (!status) return 'Draft';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  variant = 'default',
  onClick,
}: {
  to: string;
  icon: any;
  title: string;
  description: string;
  variant?: 'default' | 'primary';
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cx(
        'group flex items-start gap-4 border p-5 transition-all duration-300',
        variant === 'primary'
          ? 'border-gold-500 bg-night-800 text-cream-100 hover:bg-night-700'
          : 'border-cream-300 bg-cream-50 text-night-800 hover:border-gold-500 hover:bg-cream-100',
      )}
    >
      <div
        className={cx(
          'flex h-10 w-10 shrink-0 items-center justify-center border',
          variant === 'primary'
            ? 'border-gold-500 bg-gold-500/10 text-gold-400'
            : 'border-gold-500/40 bg-gold-50 text-gold-700',
        )}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cx('text-[15px] font-medium', variant === 'primary' ? 'text-cream-100' : 'text-night-800')}>
            {title}
          </h3>
          <ArrowRight
            size={14}
            className={cx(
              'transition-transform duration-300 group-hover:translate-x-1',
              variant === 'primary' ? 'text-gold-400' : 'text-gold-600',
            )}
          />
        </div>
        <p className={cx('mt-1 text-[12px]', variant === 'primary' ? 'text-cream-100/60' : 'text-ink-500')}>
          {description}
        </p>
      </div>
    </Link>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: any;
}) {
  return (
    <div className="border border-cream-300 bg-cream-50 p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-overline text-ink-500">{label}</span>
        <Icon size={16} className="text-gold-600" />
      </div>
      <div className="mt-3 font-display text-[32px] leading-none text-night-800">{value}</div>
      {hint && <p className="mt-2 text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}

function DraftCard({ status, ownerKind }: { status: InstituteDraftStatus | null; ownerKind: OwnerKind }) {
  const meta = OWNER_META[ownerKind];
  const hasDraft = status?.exists === true;
  const completion = typeof status?.completionPercentage === 'number' ? status.completionPercentage : 0;
  const draftStatus = status?.status || 'draft';

  return (
    <div className="border border-cream-300 bg-cream-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[18px] text-night-800">Draft Registration</h3>
          <p className="mt-1 text-[12px] text-ink-500">
            {hasDraft
              ? 'Pick up where you left off — your draft is saved.'
              : `No active ${meta.label.toLowerCase()} draft. Start a new registration when you're ready.`}
          </p>
        </div>
        <span
          className={cx(
            'inline-flex items-center gap-2 border px-3 py-1 text-[10px] uppercase tracking-overline',
            statusColor(draftStatus),
          )}
        >
          {hasDraft ? <Edit2 size={12} /> : <FileText size={12} />}
          {hasDraft ? statusLabel(draftStatus) : 'No Draft'}
        </span>
      </div>

      {hasDraft && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-overline text-ink-500">
            <span>Progress</span>
            <span className="text-night-800">{completion}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-cream-300">
            <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
        </div>
      )}

      <div className="mt-5">
        <Link
          to={hasDraft ? meta.registerPath : meta.registerPath}
          className="inline-flex items-center gap-2 bg-night-800 px-5 py-3 text-[11px] uppercase tracking-wide2 text-cream-100 transition-colors duration-300 hover:bg-gold-600"
        >
          {hasDraft ? 'Continue Registration' : meta.registerLabel}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function HostelOwnerView({ onLogout }: { onLogout: () => void }) {
  const [hostels, setHostels] = useState<HostelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMyHostels();
        if (mounted) setHostels(data);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load hostels');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const counts = useMemo(() => {
    const approved = hostels.filter((h) => {
      const s = (h.status || '').toLowerCase();
      return s === 'approved' || s === 'verified' || s === 'published' || s === 'active';
    }).length;
    const drafts = hostels.filter((h) => !h.status || h.status.toLowerCase() === 'draft').length;
    const submitted = hostels.length - approved - drafts;
    return { total: hostels.length, approved, drafts, submitted };
  }, [hostels]);

  const meta = OWNER_META.hostel;
  const Icon = meta.icon;

  return (
    <div className="space-y-10">
      <DraftCard status={null} ownerKind="hostel" />

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Registration Overview</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Total Listings" value={loading ? '…' : counts.total} icon={Home} />
          <StatTile label="Drafts" value={loading ? '…' : counts.drafts} icon={Edit2} />
          <StatTile label="Submitted" value={loading ? '…' : counts.submitted} icon={FileText} />
          <StatTile label="Approved" value={loading ? '…' : counts.approved} icon={ShieldCheck} />
        </div>
        {error && <p className="mt-3 text-[12px] text-wine">{error}</p>}
      </section>

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Owner Management</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ActionCard
            to={meta.dashboardPath}
            icon={LayoutDashboard}
            title="Owner Dashboard"
            description={`Open your full ${meta.title} dashboard with bookings and analytics.`}
            variant="primary"
          />
          <ActionCard to={meta.registerPath} icon={Plus} title={meta.registerLabel} description="Start a new hostel registration with the multi-step form." />
          <ActionCard to={meta.dashboardPath} icon={Home} title={meta.listLabel} description="View, edit, and manage your registered hostels." />
          <ActionCard to={meta.dashboardPath} icon={FileText} title="My Hostel Applications" description="Track application status, drafts, and approval progress." />
        </div>
      </section>

      {!loading && hostels.length > 0 && (
        <section>
          <h2 className="font-display text-[22px] text-night-800 mb-4">Recent Listings</h2>
          <div className="border border-cream-300 bg-cream-50 divide-y divide-cream-300">
            {hostels.slice(0, 5).map((h) => (
              <div key={h._id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-night-800">
                    {h.masked_name || h.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-500">
                    {h.hostel_type || 'Hostel'} {h.city ? `· ${h.city}` : ''} · {h.total_hostel_beds ?? 0} beds
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cx(
                      'inline-flex items-center gap-2 border px-3 py-1 text-[10px] uppercase tracking-overline',
                      statusColor(h.status),
                    )}
                  >
                    {statusLabel(h.status)}
                  </span>
                  <Link
                    to={`/hostel-dashboard`}
                    className="text-[11px] uppercase tracking-overline text-gold-700 hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Account</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onLogout}
            className="group flex items-start gap-4 border border-cream-300 bg-cream-50 p-5 text-left transition-colors duration-300 hover:border-wine hover:bg-cream-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-wine/40 bg-wine/5 text-wine">
              <LogOut size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-medium text-night-800">Logout</h3>
              <p className="mt-1 text-[12px] text-ink-500">Sign out of your Hostel Owner account.</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

function InstituteOwnerView({ onLogout }: { onLogout: () => void }) {
  const [draft, setDraft] = useState<InstituteDraftStatus | null>(null);
  const [stats, setStats] = useState<InstituteDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const meta = OWNER_META.institute;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [d, s] = await Promise.all([fetchInstituteDraftStatus(), fetchInstituteDashboardStats()]);
        if (mounted) {
          setDraft(d);
          setStats(s);
        }
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-10">
      <DraftCard status={draft} ownerKind="institute" />

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Registration Overview</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Total Listings" value={loading ? '…' : (stats?.totalInstitutes ?? 0)} icon={School} />
          <StatTile label="Drafts" value={loading ? '…' : (draft?.exists ? 1 : 0)} icon={Edit2} />
          <StatTile
            label="Submitted"
            value={loading ? '…' : (stats?.pendingApplications ?? stats?.totalApplications ?? 0)}
            icon={FileText}
          />
          <StatTile
            label="Approved"
            value={loading ? '…' : (stats?.approvedApplications ?? 0)}
            icon={ShieldCheck}
          />
        </div>
        {error && <p className="mt-3 text-[12px] text-wine">{error}</p>}
      </section>

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Owner Management</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ActionCard to={meta.dashboardPath} icon={LayoutDashboard} title="Owner Dashboard" description={`Open your full ${meta.title} dashboard.`} variant="primary" />
          <ActionCard to={meta.registerPath} icon={Plus} title={meta.registerLabel} description="Start a new institute registration with the multi-step form." />
          <ActionCard to={meta.dashboardPath} icon={School} title={meta.listLabel} description="View, edit, and manage your registered institutes." />
          <ActionCard to={meta.dashboardPath} icon={FileText} title="My Institute Applications" description="Track application status, drafts, and approval progress." />
        </div>
      </section>

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Account</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onLogout}
            className="group flex items-start gap-4 border border-cream-300 bg-cream-50 p-5 text-left transition-colors duration-300 hover:border-wine hover:bg-cream-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-wine/40 bg-wine/5 text-wine">
              <LogOut size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-medium text-night-800">Logout</h3>
              <p className="mt-1 text-[12px] text-ink-500">Sign out of your Institute Owner account.</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

function CollegeOwnerView({ onLogout }: { onLogout: () => void }) {
  const [draft, setDraft] = useState<InstituteDraftStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const meta = OWNER_META.college;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await fetchCollegeDraftStatus();
        if (mounted) setDraft(d);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-10">
      <DraftCard status={draft} ownerKind="college" />

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Registration Overview</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Total Listings" value={loading ? '…' : (draft?.exists ? 1 : 0)} icon={GraduationCap} />
          <StatTile label="Drafts" value={loading ? '…' : (draft?.exists ? 1 : 0)} icon={Edit2} />
          <StatTile label="Submitted" value={loading ? '…' : 0} icon={FileText} />
          <StatTile label="Approved" value={loading ? '…' : 0} icon={ShieldCheck} />
        </div>
        {error && <p className="mt-3 text-[12px] text-wine">{error}</p>}
      </section>

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Owner Management</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ActionCard to={meta.dashboardPath} icon={LayoutDashboard} title="Owner Dashboard" description={`Open your full ${meta.title} dashboard.`} variant="primary" />
          <ActionCard to={meta.registerPath} icon={Plus} title={meta.registerLabel} description="Start a new college registration with the multi-step form." />
          <ActionCard to={meta.dashboardPath} icon={GraduationCap} title={meta.listLabel} description="View, edit, and manage your registered colleges." />
          <ActionCard to={meta.dashboardPath} icon={FileText} title="My College Applications" description="Track application status, drafts, and approval progress." />
        </div>
      </section>

      <section>
        <h2 className="font-display text-[22px] text-night-800 mb-4">Account</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onLogout}
            className="group flex items-start gap-4 border border-cream-300 bg-cream-50 p-5 text-left transition-colors duration-300 hover:border-wine hover:bg-cream-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-wine/40 bg-wine/5 text-wine">
              <LogOut size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-medium text-night-800">Logout</h3>
              <p className="mt-1 text-[12px] text-ink-500">Sign out of your College Owner account.</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

export function OwnerProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  // Students / admins don't have an owner profile.
  useEffect(() => {
    if (!user) return;
    if (user.role === 'student' || user.role === 'admin') {
      // Students and admins have their own pages — bounce to home.
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500" />
      </div>
    );
  }

  const kind: OwnerKind | null =
    user.role === 'owner' ? 'hostel'
    : user.role === 'institute_owner' ? 'institute'
    : user.role === 'college_owner' ? 'college'
    : null;

  if (!kind) {
    return null;
  }

  const meta = OWNER_META[kind];
  const Icon = meta.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-cream">
      {/* Cinematic masthead */}
      <div className="relative h-56 w-full overflow-hidden bg-night-900 md:h-64">
        <div className="absolute inset-0 bg-gradient-to-b from-night-900/40 via-night-900/60 to-night-900/80" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-6 pb-8 md:px-12">
            <p className="text-[11px] uppercase tracking-overline text-gold-400">Owner Profile</p>
            <h1 className="mt-2 font-display text-[40px] leading-tight text-cream-100 md:text-[48px]">
              {user.name}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-[11px] uppercase tracking-overline text-gold-300">
              <Icon size={14} />
              {meta.title}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-12 md:py-16">
        {/* Profile info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="-mt-16 mb-12 flex flex-col gap-6 border border-cream-300 bg-cream-50 p-6 shadow-lift md:flex-row md:items-center"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-gold-500/40 bg-gold-50 text-gold-700">
            <UserIcon size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-overline text-ink-500">Owner Information</p>
            <h2 className="mt-1 font-display text-[22px] text-night-800">{user.name}</h2>
            <p className="mt-1 text-[13px] text-ink-500">{user.email}</p>
            {user.phone && <p className="mt-0.5 text-[13px] text-ink-500">{user.phone}</p>}
          </div>
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-overline text-gold-700 hover:underline"
          >
            ← Continue browsing
          </Link>
        </motion.div>

        {kind === 'hostel' && <HostelOwnerView onLogout={handleLogout} />}
        {kind === 'institute' && <InstituteOwnerView onLogout={handleLogout} />}
        {kind === 'college' && <CollegeOwnerView onLogout={handleLogout} />}
      </div>
    </div>
  );
}
