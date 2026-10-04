import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Edit,
  FileText,
  Clock,
  AlertCircle,
  Trash2,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Calendar,
  TrendingUp,
  Send,
  FileCheck,
  Award,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as draftService from '../services/instituteDraft.service';

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

function formatDate(value: string | undefined) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysSince(iso: string | undefined) {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export default function InstituteOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draftStatus, setDraftStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'institute_owner') {
      loadDraftStatus();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadDraftStatus = async () => {
    try {
      setLoading(true);
      const response = await draftService.getDraftStatus();
      if (response && response.success && response.data) {
        setDraftStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to load draft status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueEditing = () => navigate('/institute-owner/register');
  const handleStartNew = () => navigate('/institute-owner/register');

  const handleResubmit = async () => {
    if (!confirm('Resubmit your application with the latest changes?')) return;
    try {
      setResubmitting(true);
      const res = await draftService.submitDraft();
      if (res?.success) {
        alert('Application resubmitted successfully.');
        await loadDraftStatus();
      } else {
        alert(res?.message || 'Resubmit failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Resubmit failed');
    } finally {
      setResubmitting(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!confirm('Are you sure you want to delete your draft? This action cannot be undone.'))
      return;
    try {
      setDeleting(true);
      await draftService.deleteDraft();
      setDraftStatus(null);
      alert('Draft deleted successfully');
    } catch (err) {
      console.error('Failed to delete draft:', err);
      alert('Failed to delete draft');
    } finally {
      setDeleting(false);
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

  const info = draftStatus?.step1InstituteInfo || {};
  const instituteName = info.instituteName || 'Untitled Institute';
  const description = info.about || info.description;
  const establishedYear = info.establishedYear;
  const logo = info.logoPreview || info.logoFile;

  const days = daysSince(draftStatus?.submittedAt);

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="overline text-cream-100/60">Loading dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950">
      {/* Header */}
      <div className="max-w-page mx-auto px-6 md:px-12 pt-12 md:pt-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10 border-b border-night-700">
          <div>
            <p className="overline text-gold-400">Institute Owner</p>
            <h1 className="mt-3 font-display text-d3 md:text-d2 text-cream-100">
              Welcome back, <em className="italic text-gold-500">{user?.name || 'Owner'}</em>
            </h1>
            <p className="mt-2 text-sm text-cream-100/50 max-w-md">
              Manage your institute registration, track review status, and edit your submission
              from a single place.
            </p>
          </div>
          {draftStatus && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleContinueEditing}
                className="group inline-flex items-center gap-3 border border-night-700 px-6 py-3 text-[11px] uppercase tracking-wide2 text-cream-100 transition-colors duration-500 hover:border-gold-500 hover:text-gold-400"
              >
                <Edit size={14} />
                {isVerified ? 'View Institute' : 'Edit Application'}
              </button>
              {(isSubmitted || isChangesRequested) && (
                <button
                  onClick={handleResubmit}
                  disabled={resubmitting}
                  className="inline-flex items-center gap-3 bg-gold-500 px-6 py-3 text-[11px] uppercase tracking-wide2 text-night-900 transition-colors duration-300 hover:bg-gold-400 disabled:opacity-50"
                >
                  <Send size={14} />
                  {resubmitting ? 'Submitting…' : 'Resubmit'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10 md:py-12">
        {draftStatus ? (
          <DashboardContent
            draftStatus={draftStatus}
            verificationStatus={verificationStatus}
            instituteName={instituteName}
            description={description}
            establishedYear={establishedYear}
            logo={logo}
            days={days}
            isDraftLike={isDraftLike}
            isSubmitted={isSubmitted}
            isChangesRequested={isChangesRequested}
            isVerified={isVerified}
            isRejected={isRejected}
            deleting={deleting}
            onContinueEditing={handleContinueEditing}
            onResubmit={handleResubmit}
            resubmitting={resubmitting}
            onDelete={handleDeleteDraft}
          />
        ) : (
          <EmptyState onStartNew={handleStartNew} />
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'gold',
}: {
  label: string;
  value: string | number;
  icon: any;
  accent?: 'gold' | 'cream';
}) {
  const accentClass = accent === 'gold' ? 'text-gold-400' : 'text-cream-100';
  return (
    <div className="border border-night-700 bg-night-900 p-6 md:p-8 transition-colors duration-500 hover:border-night-600">
      <div className="flex items-center justify-between mb-6">
        <p className="overline text-cream-100/40">{label}</p>
        <Icon size={16} className="text-gold-500/60" />
      </div>
      <p className={`font-display text-d3 ${accentClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; classes: string; icon: any }
  > = {
    draft: {
      label: 'Draft',
      classes: 'border-gold-500/40 bg-gold-500/5 text-gold-300',
      icon: Clock,
    },
    submitted: {
      label: 'Submitted',
      classes: 'border-blue-400/40 bg-blue-400/5 text-blue-300',
      icon: FileText,
    },
    under_review: {
      label: 'Under Review',
      classes: 'border-purple-400/40 bg-purple-400/5 text-purple-300',
      icon: Eye,
    },
    changes_requested: {
      label: 'Changes Requested',
      classes: 'border-wine bg-wine/10 text-cream-100',
      icon: AlertCircle,
    },
    resubmitted: {
      label: 'Resubmitted',
      classes: 'border-indigo-400/40 bg-indigo-400/5 text-indigo-300',
      icon: Send,
    },
    verified: {
      label: 'Verified',
      classes: 'border-green-400/40 bg-green-400/5 text-green-300',
      icon: CheckCircle,
    },
    published: {
      label: 'Live',
      classes: 'border-emerald-400/40 bg-emerald-400/5 text-emerald-300',
      icon: Award,
    },
    rejected: {
      label: 'Rejected',
      classes: 'border-red-400/40 bg-red-400/5 text-red-300',
      icon: AlertCircle,
    },
    suspended: {
      label: 'Suspended',
      classes: 'border-night-600 bg-night-800 text-cream-100/50',
      icon: AlertCircle,
    },
  };
  const c = config[status] || config.draft;
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-wide2 ${c.classes}`}
    >
      <Icon size={12} />
      {c.label}
    </span>
  );
}

function ProgressTimeline({ currentStep, status }: { currentStep: number; status: string }) {
  // Submitted/verified applications are 100% complete.
  const completed =
    status === 'submitted' ||
    status === 'under_review' ||
    status === 'verified' ||
    status === 'rejected' ||
    status === 'changes_requested'
      ? TOTAL_STEPS
      : Math.max(0, Math.min(TOTAL_STEPS, currentStep || 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="overline text-gold-400/80">Folio 01</p>
          <h3 className="mt-2 font-display text-d4 text-cream-100">Registration Progress</h3>
        </div>
        <p className="font-display text-d4 text-gold-400">
          {completed}
          <span className="text-cream-100/30"> / {TOTAL_STEPS}</span>
        </p>
      </div>

      {/* Hairline progress bar */}
      <div className="h-px bg-night-700 relative mb-8">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gold-500"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Step pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STEP_LABELS.map((label, i) => {
          const isDone = i < completed;
          const isCurrent = i === completed && completed < TOTAL_STEPS;
          return (
            <div
              key={i}
              className={`border px-3 py-3 text-left transition-colors duration-500 ${
                isDone
                  ? 'border-gold-500/40 bg-gold-500/5'
                  : isCurrent
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-night-700 bg-night-900'
              }`}
            >
              <p
                className={`text-[10px] uppercase tracking-wide2 mb-1 ${
                  isDone || isCurrent ? 'text-gold-400' : 'text-cream-100/30'
                }`}
              >
                Step {String(i + 1).padStart(2, '0')}
              </p>
              <p
                className={`text-xs leading-tight ${
                  isDone || isCurrent ? 'text-cream-100' : 'text-cream-100/40'
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: any) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-gold-500/60 mt-1 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide2 text-cream-100/40 mb-1">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gold-400 hover:text-gold-300 underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-cream-100 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

function DashboardContent(props: any) {
  const {
    draftStatus,
    verificationStatus,
    instituteName,
    description,
    establishedYear,
    logo,
    days,
    isDraftLike,
    isSubmitted,
    isChangesRequested,
    isVerified,
    isRejected,
    deleting,
    resubmitting,
    onContinueEditing,
    onResubmit,
    onDelete,
  } = props;

  return (
    <div className="space-y-8">
      {/* Hero card — institute identity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="border border-night-700 bg-night-900 p-8 md:p-12"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo ? (
              <div className="w-24 h-24 md:w-28 md:h-28 border border-gold-500/40 overflow-hidden bg-night-800">
                <img
                  src={logo}
                  alt={instituteName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 border border-night-700 flex items-center justify-center bg-night-800">
                <Building2 className="w-10 h-10 text-gold-500/30" />
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <p className="overline text-gold-400/80">Your Institute</p>
            <h2 className="mt-2 font-display text-d2 md:text-d1 text-cream-100 break-words">
              {instituteName}
            </h2>
            {description && (
              <p className="mt-3 text-sm text-cream-100/60 max-w-2xl leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
            <div className="mt-5 flex items-center gap-4 flex-wrap">
              <StatusBadge status={verificationStatus} />
              {draftStatus?.submittedAt && (
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-cream-100/40">
                  <Calendar size={12} />
                  Submitted {formatDate(draftStatus.submittedAt)}
                </span>
              )}
              {establishedYear && (
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-cream-100/40">
                  <TrendingUp size={12} />
                  Est. {establishedYear}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stat row */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Completion"
          value={`${draftStatus?.completionPercentage || 0}%`}
          icon={TrendingUp}
        />
        <StatCard
          label={
            isSubmitted || isChangesRequested
              ? 'Days in Review'
              : isVerified
                ? 'Days Live'
                : 'Days Saved'
          }
          value={isDraftLike ? formatDate(draftStatus?.lastSavedAt) || '—' : days || 0}
          icon={Calendar}
        />
        <StatCard
          label="Steps Done"
          value={
            isDraftLike
              ? `${draftStatus?.currentStep || 0} / ${TOTAL_STEPS}`
              : `${TOTAL_STEPS} / ${TOTAL_STEPS}`
          }
          icon={FileCheck}
        />
        <StatCard
          label="Status"
          value={verificationStatus.replace(/_/g, ' ')}
          icon={isVerified ? Award : Clock}
          accent="gold"
        />
      </motion.section>

      {/* Progress timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="border border-night-700 bg-night-900 p-8 md:p-12"
      >
        <ProgressTimeline
          currentStep={draftStatus?.currentStep || 0}
          status={verificationStatus}
        />
      </motion.section>

      {/* Admin feedback / changes requested */}
      {(isChangesRequested || verificationStatus === 'changes_requested') &&
        draftStatus?.adminFeedback && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-wine bg-wine/10 p-8 md:p-10"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="text-wine flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="overline text-cream-100/60 mb-2">Admin Feedback</p>
                <h3 className="font-display text-d4 text-cream-100 mb-3">
                  Changes have been requested
                </h3>
                <p className="text-sm text-cream-100/80 leading-relaxed whitespace-pre-line">
                  {draftStatus.adminFeedback}
                </p>
                <button
                  onClick={onContinueEditing}
                  className="mt-6 inline-flex items-center gap-3 border border-wine/60 text-cream-100 px-6 py-3 text-[11px] uppercase tracking-wide2 hover:bg-wine/20 transition-colors"
                >
                  <Edit size={14} />
                  Edit & Resubmit
                </button>
              </div>
            </div>
          </motion.section>
        )}

      {/* Rejection */}
      {isRejected && draftStatus?.rejectionReason && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-red-500/40 bg-red-500/5 p-8 md:p-10"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="overline text-red-300/80 mb-2">Application Rejected</p>
              <h3 className="font-display text-d4 text-cream-100 mb-3">
                Your application was not approved
              </h3>
              <p className="text-sm text-cream-100/80 leading-relaxed whitespace-pre-line">
                {draftStatus.rejectionReason}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Verified success */}
      {isVerified && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-green-400/40 bg-green-400/5 p-8 md:p-10"
        >
          <div className="flex items-start gap-4">
            <CheckCircle className="text-green-300 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="overline text-green-300/80 mb-2">Verified</p>
              <h3 className="font-display text-d4 text-cream-100 mb-2">
                Your institute is approved
              </h3>
              <p className="text-sm text-cream-100/80 leading-relaxed">
                Congratulations — your institute is verified and will be published on the platform
                shortly.
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Action bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="border border-night-700 bg-night-900 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h3 className="font-display text-d5 text-cream-100">Manage Application</h3>
          <p className="mt-1 text-xs text-cream-100/50 max-w-md">
            {isSubmitted
              ? 'You can edit your application at any time and resubmit when ready.'
              : isChangesRequested
                ? 'Make the requested changes and resubmit for another review.'
                : isVerified
                  ? 'Your institute is verified and live. You can still update your details.'
                  : 'Continue your registration to submit it for review.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onContinueEditing}
            className="inline-flex items-center gap-3 border border-gold-500/50 px-6 py-3 text-[11px] uppercase tracking-wide2 text-gold-400 transition-colors duration-500 hover:bg-gold-500 hover:text-night-900"
          >
            <Edit size={14} />
            {isVerified ? 'View Institute' : 'Edit Application'}
          </button>
          {(isSubmitted || isChangesRequested) && (
            <button
              onClick={onResubmit}
              disabled={resubmitting}
              className="inline-flex items-center gap-3 bg-gold-500 px-6 py-3 text-[11px] uppercase tracking-wide2 text-night-900 transition-colors duration-300 hover:bg-gold-400 disabled:opacity-50"
            >
              <Send size={14} />
              {resubmitting ? 'Submitting…' : 'Resubmit'}
            </button>
          )}
          {(isDraftLike || isChangesRequested) && (
            <button
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-3 border border-red-500/30 px-6 py-3 text-[11px] uppercase tracking-wide2 text-red-400 transition-colors duration-500 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function EmptyState({ onStartNew }: { onStartNew: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-night-700 bg-night-900 py-24 px-8 text-center"
    >
      <div className="inline-flex w-20 h-20 border border-gold-500/30 items-center justify-center mb-8">
        <FileText className="w-8 h-8 text-gold-500/50" />
      </div>
      <p className="overline text-gold-400">No Registration Found</p>
      <h2 className="mt-4 font-display text-d3 text-cream-100">
        Start your <em className="italic text-gold-500">institute's journey</em>
      </h2>
      <p className="mt-4 text-sm text-cream-100/50 max-w-md mx-auto">
        Register your institute on EasyToFindEdu to be discovered by thousands of students and
        parents across India.
      </p>
      <button
        onClick={onStartNew}
        className="mt-10 inline-flex items-center gap-3 bg-gold-500 px-8 py-4 text-[11px] uppercase tracking-wide2 text-night-900 transition-colors duration-300 hover:bg-gold-400"
      >
        <Edit size={14} />
        Start Registration
      </button>
    </motion.section>
  );
}
