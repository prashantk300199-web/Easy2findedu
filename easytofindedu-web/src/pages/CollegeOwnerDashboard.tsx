import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ShieldOff,
  Edit2,
  Send,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as draftService from '../services/collegeDraft.service';

const TOTAL_STEPS = 12;

const STEP_LABELS = [
  'Basic Info',
  'Location',
  'Affiliation',
  'Courses',
  'Admission & Fees',
  'Facilities',
  'Hostel',
  'Placements',
  'Scholarships',
  'Gallery',
  'Documents',
  'Review & Submit',
];

const STATUS_BADGE = {
  draft: { label: 'Draft', classes: 'border-night-700 bg-night-800/40 text-cream-100/80', icon: Edit2 },
  submitted: { label: 'Submitted', classes: 'border-blue-400/40 bg-blue-400/5 text-blue-300', icon: Clock },
  under_review: { label: 'Under Review', classes: 'border-blue-400/40 bg-blue-400/5 text-blue-300', icon: Eye },
  changes_requested: { label: 'Changes Requested', classes: 'border-amber-400/40 bg-amber-400/5 text-amber-300', icon: AlertCircle },
  resubmitted: { label: 'Resubmitted', classes: 'border-blue-400/40 bg-blue-400/5 text-blue-300', icon: Send },
  verified: { label: 'Verified', classes: 'border-green-400/40 bg-green-400/5 text-green-300', icon: CheckCircle },
  published: { label: 'Published', classes: 'border-green-400/40 bg-green-400/5 text-green-300', icon: CheckCircle },
  rejected: { label: 'Rejected', classes: 'border-red-400/40 bg-red-400/5 text-red-300', icon: XCircle },
  suspended: { label: 'Suspended', classes: 'border-orange-400/40 bg-orange-400/5 text-orange-300', icon: ShieldOff },
};

function StatusBadge({ status }: { status: string }) {
  const meta = (STATUS_BADGE as any)[status] || STATUS_BADGE.draft;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-2 border px-3 py-1 text-[11px] uppercase tracking-overline ${meta.classes}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}

function ProgressTimeline({
  currentStep,
  completionPercentage,
  status,
}: {
  currentStep: number;
  completionPercentage: number;
  status: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="overline">Application progress</span>
        <span className="text-sm text-cream-100/70">{completionPercentage}% complete</span>
      </div>
      <div className="relative h-1.5 bg-night-800 mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gold-500"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const reached = stepNum <= currentStep;
          return (
            <div
              key={label}
              className={`border px-2 py-2 text-[10px] uppercase tracking-overline text-center ${
                reached
                  ? 'border-gold-500/60 bg-gold-500/10 text-gold-300'
                  : 'border-night-700 bg-night-800/30 text-cream-100/40'
              }`}
              title={`Step ${stepNum} of ${TOTAL_STEPS}: ${label}`}
            >
              <div className="font-display text-base">{stepNum}</div>
              <div className="leading-tight">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-night-700 bg-night-900/50 px-5 py-4">
      <div className="overline mb-1">{label}</div>
      <div className="font-display text-2xl text-cream-100">{value}</div>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="border border-night-700 bg-night-900/50 p-12 text-center">
      <Building2 className="mx-auto text-gold-500 mb-4" size={32} />
      <h3 className="font-display text-2xl text-cream-100 mb-2">{title}</h3>
      <p className="text-sm text-cream-100/60 mb-6">{hint}</p>
      <a
        href="/college-registration"
        className="inline-block px-6 py-3 bg-gold-500 text-night-800 hover:bg-gold-400 text-[12px] uppercase tracking-wide2 font-semibold"
      >
        Start College Onboarding
      </a>
    </div>
  );
}

export default function CollegeOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draftStatus, setDraftStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'college_owner') {
      navigate('/dashboard');
      return;
    }
    loadDraftStatus();
  }, [user]);

  const loadDraftStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await draftService.getDraftStatus();
      if (response?.success) setDraftStatus(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load application status');
    } finally {
      setLoading(false);
    }
  };

  const verificationStatus = useMemo(
    () => draftStatus?.verificationStatus || draftStatus?.status || 'draft',
    [draftStatus],
  );

  const isDraftLike = verificationStatus === 'draft';
  const isSubmitted = verificationStatus === 'submitted' || verificationStatus === 'under_review';
  const isChangesRequested = verificationStatus === 'changes_requested';
  const isVerified = verificationStatus === 'verified';
  const isRejected = verificationStatus === 'rejected';
  const isSuspended = verificationStatus === 'suspended';

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-gold-500 animate-spin mb-4" />
          <p className="text-cream-100/60">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-night-950 px-6 py-16">
        <div className="max-w-3xl mx-auto border border-red-500/40 bg-red-500/5 p-6 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  const step1 = draftStatus?.step1BasicInfo || {};
  const collegeName = step1.collegeName || 'Your college';

  return (
    <div className="min-h-screen bg-night-950 text-cream-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="border-b border-night-800 pb-8 mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="overline mb-2">College Owner</div>
            <h1 className="text-[36px] md:text-[42px] font-display font-semibold text-cream-100 leading-tight">
              Welcome back
              <span className="block text-gold-500 italic mt-1">{user?.name || 'College Owner'}</span>
            </h1>
            <p className="mt-3 text-sm text-cream-100/60">
              {collegeName} · {draftStatus ? `Step ${draftStatus.currentStep || 1} of ${TOTAL_STEPS}` : 'Not started'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={verificationStatus} />
          </div>
        </div>

        {!draftStatus ? (
          <EmptyState
            title="No application yet"
            hint="Start your college onboarding to begin your application."
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="Completion" value={`${draftStatus.completionPercentage || 0}%`} />
              <StatCard label="Current step" value={`${draftStatus.currentStep || 1} / ${TOTAL_STEPS}`} />
              <StatCard
                label="Submitted"
                value={draftStatus.submittedAt ? new Date(draftStatus.submittedAt).toLocaleDateString() : '—'}
              />
              <StatCard label="Last saved" value={draftStatus.lastSavedAt ? new Date(draftStatus.lastSavedAt).toLocaleDateString() : '—'} />
            </div>

            {/* Timeline */}
            <div className="border border-night-700 bg-night-900/40 p-6 mb-10">
              <ProgressTimeline
                currentStep={draftStatus.currentStep || 1}
                completionPercentage={draftStatus.completionPercentage || 0}
                status={verificationStatus}
              />
            </div>

            {/* Status banners */}
            {isChangesRequested && draftStatus.adminFeedback && (
              <div className="border border-amber-400/40 bg-amber-400/5 p-6 mb-6">
                <div className="flex items-center gap-2 mb-2 text-amber-300 overline">
                  <AlertCircle size={16} /> Changes Required
                </div>
                <p className="text-cream-100/80">{draftStatus.adminFeedback}</p>
              </div>
            )}

            {isRejected && (
              <div className="border border-red-400/40 bg-red-400/5 p-6 mb-6">
                <div className="flex items-center gap-2 mb-2 text-red-300 overline">
                  <XCircle size={16} /> Application Rejected
                </div>
                <p className="text-cream-100/80">{draftStatus.rejectionReason || 'No reason provided.'}</p>
              </div>
            )}

            {isSuspended && (
              <div className="border border-orange-400/40 bg-orange-400/5 p-6 mb-6">
                <div className="flex items-center gap-2 mb-2 text-orange-300 overline">
                  <ShieldOff size={16} /> College Suspended
                </div>
                <p className="text-cream-100/80">Your college is currently suspended and hidden from the public site.</p>
              </div>
            )}

            {isVerified && (
              <div className="border border-green-400/40 bg-green-400/5 p-6 mb-6">
                <div className="flex items-center gap-2 text-green-300 overline">
                  <CheckCircle size={16} /> Application Verified
                </div>
                <p className="text-cream-100/80 mt-2">
                  Your college is live on the public site. You can still edit your application.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/college-registration')}
                className="px-6 py-3 bg-gold-500 text-night-800 hover:bg-gold-400 text-[12px] uppercase tracking-wide2 font-semibold"
              >
                {isDraftLike ? 'Continue Onboarding' : isChangesRequested ? 'Update Application' : 'Edit Application'}
              </button>

              {(isVerified) && (
                <button
                  type="button"
                  onClick={() => navigate('/colleges')}
                  className="px-6 py-3 border border-gold-500/60 text-gold-400 hover:bg-gold-500/10 text-[12px] uppercase tracking-wide2"
                >
                  View Public Profile
                </button>
              )}

              <button
                type="button"
                onClick={loadDraftStatus}
                className="px-6 py-3 border border-night-700 text-cream-100/70 hover:border-cream-300 hover:text-cream-100 text-[12px] uppercase tracking-wide2"
              >
                <RefreshCw size={14} className="inline mr-2" />
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}