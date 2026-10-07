import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  searchScholarships,
  getFeaturedScholarships,
  getClosingSoonScholarships,
  getScholarshipFacets,
  getRecommendedScholarships,
  type Scholarship,
  type ScholarshipFacets,
  type ScholarshipPage,
} from '../../services/scholarship.service';
import { Spinner } from '../../components/primitives';

// ─── Constants ─────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'deadline_soonest', label: 'Deadline soonest' },
  { value: 'amount_high_to_low', label: 'Amount: high to low' },
  { value: 'amount_low_to_high', label: 'Amount: low to high' },
  { value: 'newest', label: 'Newest' },
];

const SCHOLARSHIP_TYPES = [
  { value: 'merit', label: 'Merit' },
  { value: 'need', label: 'Need-based' },
  { value: 'merit_cum_need', label: 'Merit + Need' },
  { value: 'government', label: 'Government' },
  { value: 'state', label: 'State' },
  { value: 'university', label: 'University' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'research', label: 'Research' },
  { value: 'gender', label: 'Women' },
  { value: 'category', label: 'Category' },
  { value: 'minority', label: 'Minority' },
  { value: 'disability', label: 'Disability' },
  { value: 'sports', label: 'Sports' },
];

const EDUCATION_LEVELS = [
  { value: 'class_10th', label: 'Class 10' },
  { value: 'class_12th', label: 'Class 12' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
];

const ELIGIBLE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'obc', label: 'OBC' },
  { value: 'ews', label: 'EWS' },
  { value: 'minority', label: 'Minority' },
  { value: 'pwd', label: 'PwD' },
  { value: 'women', label: 'Women' },
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'female_only', label: 'Women only' },
  { value: 'male_only', label: 'Men only' },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'OPEN', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  upcoming: { label: 'UPCOMING', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  closing_soon: { label: 'CLOSING SOON', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  closed: { label: 'CLOSED', className: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  expired: { label: 'EXPIRED', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
  unknown: { label: 'STATUS UNKNOWN', className: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
};

const SOURCE_TYPE_BADGE: Record<string, string> = {
  government: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  university: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  foundation: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  organization: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  other: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

function formatShortDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

function formatLastVerified(iso: string | null) {
  if (!iso) return 'Date not recorded';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Date not recorded';
  }
}

// ─── Sub-components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE.unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function ScholarshipCard({ s }: { s: Scholarship }) {
  const isDark = (s.computedStatus === 'closed' || s.computedStatus === 'expired');
  return (
    <Link
      to={`/career/scholarships/${s.slug || s._id}`}
      className={`group block bg-night-800/50 border border-cream-100/10 rounded-2xl overflow-hidden hover:border-gold-500/40 hover:bg-night-800/70 transition-all duration-300 ${
        isDark ? 'opacity-65' : ''
      }`}
    >
      <div className="p-5 md:p-6 flex flex-col h-full">
        {/* Top row: source + status */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider border ${
            SOURCE_TYPE_BADGE[s.source?.sourceType] || SOURCE_TYPE_BADGE.other
          }`}>
            {(s.source?.sourceType || 'other').toUpperCase()}
          </span>
          <StatusBadge status={s.computedStatus} />
        </div>

        {/* Name */}
        <h3 className="font-display text-lg text-cream-100 leading-snug group-hover:text-gold-400 transition-colors mb-2 line-clamp-2">
          {s.name}
        </h3>

        {/* Provider */}
        <p className="text-xs text-cream-100/40 mb-4 line-clamp-1">
          by {s.source?.sourceName || 'Official Provider'}
        </p>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-0.5">Benefit</p>
          <p className="text-gold-400 font-medium text-sm">{s.amountLabel || 'Amount not specified'}</p>
        </div>

        {/* Meta: education level + category */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {s.eligibility?.educationLevels?.filter(l => l !== 'any').slice(0, 2).map((l) => (
            <span key={l} className="px-2 py-0.5 rounded text-[10px] bg-cream-100/5 text-cream-100/60 border border-cream-100/10">
              {l.replace('_', ' ').replace('class ', 'Class ')}
            </span>
          ))}
          {s.eligibility?.categories?.filter(c => c !== 'any' && c !== 'general').slice(0, 2).map((c) => (
            <span key={c} className="px-2 py-0.5 rounded text-[10px] bg-cream-100/5 text-cream-100/60 border border-cream-100/10 uppercase">
              {c}
            </span>
          ))}
          {s.eligibility?.gender && s.eligibility.gender !== 'any' && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-pink-500/10 text-pink-300 border border-pink-500/20">
              {s.eligibility.gender === 'female_only' ? 'Women' : 'Men'}
            </span>
          )}
        </div>

        {/* Deadline row */}
        <div className="mt-auto pt-4 border-t border-cream-100/5">
          <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-0.5">Deadline</p>
          <p className="text-cream-100/80 text-sm">{s.deadlineLabel || 'Deadline not specified'}</p>
          {s.deadline?.isExactDateConfirmed && s.deadline?.applicationEndDate && (
            <p className="text-[10px] text-cream-100/30 mt-0.5">Exact date confirmed</p>
          )}
        </div>

        {/* Footer: source verified */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-100/5">
          <span className="text-[10px] text-emerald-300/80 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Source verified
          </span>
          <span className="text-[10px] text-cream-100/30">
            {formatLastVerified(s.source?.lastVerifiedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ScholarshipCardSkeleton() {
  return (
    <div className="bg-night-800/50 border border-cream-100/10 rounded-2xl p-5 md:p-6 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-20 bg-night-700 rounded" />
        <div className="h-4 w-16 bg-night-700 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-night-700 rounded mb-2" />
      <div className="h-3 w-1/2 bg-night-700 rounded mb-4" />
      <div className="h-3 w-1/3 bg-night-700 rounded mb-1" />
      <div className="h-4 w-2/3 bg-night-700 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-4 w-12 bg-night-700 rounded" />
        <div className="h-4 w-12 bg-night-700 rounded" />
      </div>
      <div className="h-px bg-night-700 mb-3" />
      <div className="h-3 w-1/3 bg-night-700 rounded mb-1" />
      <div className="h-4 w-2/3 bg-night-700 rounded" />
    </div>
  );
}

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs border transition-all whitespace-nowrap ${
        active
          ? 'border-gold-500 bg-gold-500/15 text-gold-300'
          : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/30 hover:text-cream-100/80'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────

export default function ScholarshipFinderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  // URL-synced filters
  const query = params.get('query') || '';
  const sortBy = params.get('sortBy') || 'relevance';
  const educationLevel = params.get('educationLevel') || '';
  const eligibleCategory = params.get('eligibleCategory') || '';
  const gender = params.get('gender') || '';
  const state = params.get('state') || '';
  const scholarshipType = params.get('scholarshipType') || '';
  const category = params.get('category') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const [draftQuery, setDraftQuery] = useState(query);
  const [page2, setPage2] = useState<ScholarshipPage | null>(null);
  const [featured, setFeatured] = useState<Scholarship[]>([]);
  const [closingSoon, setClosingSoon] = useState<Scholarship[]>([]);
  const [recommended, setRecommended] = useState<{ items: Scholarship[]; profileComplete: boolean } | null>(null);
  const [facets, setFacets] = useState<ScholarshipFacets | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRails, setLoadingRails] = useState(true);
  const [listError, setListError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const updateParams = useCallback((patch: Record<string, string | undefined>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === '' || v === null) next.delete(k);
        else next.set(k, v);
      });
      return next;
    }, { replace: true });
  }, [setParams]);

  // Fetch featured/closing-soon/recommended/facets once on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchRails() {
      setLoadingRails(true);
      try {
        const [feat, cs, rec, fac] = await Promise.all([
          getFeaturedScholarships(6).catch(() => ({ items: [] })),
          getClosingSoonScholarships(8).catch(() => ({ items: [] })),
          getRecommendedScholarships(8).catch(() => ({ items: [], profileComplete: false })),
          getScholarshipFacets().catch(() => null),
        ]);
        if (cancelled) return;
        setFeatured(feat.items || []);
        setClosingSoon(cs.items || []);
        setRecommended(rec);
        setFacets(fac);
      } finally {
        if (!cancelled) setLoadingRails(false);
      }
    }
    fetchRails();
    return () => { cancelled = true; };
  }, [user]);

  // Main list query
  useEffect(() => {
    let cancelled = false;
    async function fetchList() {
      setLoadingList(true);
      setListError('');
      try {
        const result = await searchScholarships({
          query: query || undefined,
          sortBy,
          educationLevel: educationLevel || undefined,
          eligibleCategory: eligibleCategory || undefined,
          gender: gender || undefined,
          state: state || undefined,
          scholarshipType: scholarshipType || undefined,
          category: category || undefined,
          page,
          limit: 12,
        });
        if (cancelled) return;
        setPage2(result);
      } catch (err) {
        if (cancelled) return;
        setListError(err instanceof Error ? err.message : 'Unable to load scholarships right now.');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    fetchList();
    return () => { cancelled = true; };
  }, [query, sortBy, educationLevel, eligibleCategory, gender, state, scholarshipType, category, page]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (draftQuery !== query) updateParams({ query: draftQuery || undefined, page: undefined });
    }, 400);
    return () => clearTimeout(t);
  }, [draftQuery, query, updateParams]);

  const clearFilters = useCallback(() => {
    setParams({}, { replace: true });
    setDraftQuery('');
  }, [setParams]);

  const hasFilters = useMemo(() => (
    educationLevel || eligibleCategory || gender || state || scholarshipType || category || query
  ), [educationLevel, eligibleCategory, gender, state, scholarshipType, category, query]);

  const items = page2?.items || [];
  const total = page2?.pagination?.total || 0;
  const totalPages = page2?.pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-night-900">
      {/* Hero */}
      <div className="bg-night-900 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <Link
            to="/career-guidance"
            className="text-xs text-cream-100/40 hover:text-gold-500 transition-colors mb-6 inline-block"
          >
            ← Back to Career Guidance
          </Link>
          <p className="text-gold-500/70 text-sm font-mono tracking-widest mb-3">CAREER GUIDANCE</p>
          <h1 className="font-display text-d2 text-cream-100 mb-4">Scholarship Finder</h1>
          <p className="text-cream-100/50 text-base max-w-2xl">
            Discover scholarships and financial aid opportunities that match your education, eligibility and goals.
          </p>
          <p className="text-cream-100/30 text-xs mt-3 max-w-2xl">
            Every scholarship listed below is sourced from a verified official provider. We do not invent deadlines, amounts, or eligibility — if a value is unverified, we show it as such.
          </p>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 pb-16">
        {/* Recommended / Personalized section */}
        {user && recommended && recommended.items.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-d4 text-cream-100">Recommended for You</h2>
                <p className="text-cream-100/40 text-sm mt-1">
                  {recommended.profileComplete
                    ? 'Based on your education, stream and profile.'
                    : 'Complete your profile to get more personalized scholarship matches.'}
                </p>
              </div>
              {!recommended.profileComplete && (
                <button
                  onClick={() => navigate('/career-guidance')}
                  className="text-xs text-gold-500/80 hover:text-gold-400 transition-colors"
                >
                  Complete profile →
                </button>
              )}
            </div>
            {loadingRails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.items.slice(0, 6).map((s) => (
                  <ScholarshipCard key={`rec-${s._id}`} s={s} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Closing Soon */}
        {closingSoon.length > 0 && !hasFilters && (
          <section className="mb-12">
            <h2 className="font-display text-d4 text-cream-100 mb-5">Open & Closing Soon</h2>
            {loadingRails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {closingSoon.slice(0, 4).map((s) => (
                  <ScholarshipCard key={`cs-${s._id}`} s={s} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured */}
        {featured.length > 0 && !hasFilters && (
          <section className="mb-12">
            <h2 className="font-display text-d4 text-cream-100 mb-5">Featured Scholarships</h2>
            {loadingRails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
                <ScholarshipCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.slice(0, 6).map((s) => (
                  <ScholarshipCard key={`feat-${s._id}`} s={s} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* All scholarships header */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-d4 text-cream-100">All Scholarships</h2>
            <p className="text-cream-100/40 text-sm">
              {loadingList ? 'Loading…' : `${total} found`}
            </p>
          </div>

          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Search by scholarship name, provider, course…"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="md:hidden px-5 py-3.5 rounded-xl border border-cream-100/10 text-cream-100/70 text-sm hover:border-cream-100/30"
            >
              {showFilters ? 'Hide filters' : 'Show filters'}
            </button>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6 space-y-4`}>
            {/* Sort */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-cream-100/40 font-medium">Sort:</span>
              {SORT_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.value}
                  label={opt.label}
                  active={sortBy === opt.value}
                  onClick={() => updateParams({ sortBy: opt.value === 'relevance' ? undefined : opt.value, page: undefined })}
                />
              ))}
            </div>

            {/* Scholarship Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-cream-100/40 font-medium">Type:</span>
              <FilterPill label="All" active={!scholarshipType} onClick={() => updateParams({ scholarshipType: undefined, page: undefined })} />
              {SCHOLARSHIP_TYPES.map((t) => (
                <FilterPill
                  key={t.value}
                  label={t.label}
                  active={scholarshipType === t.value}
                  onClick={() => updateParams({ scholarshipType: scholarshipType === t.value ? undefined : t.value, page: undefined })}
                />
              ))}
            </div>

            {/* Education level */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-cream-100/40 font-medium">Level:</span>
              <FilterPill label="Any" active={!educationLevel} onClick={() => updateParams({ educationLevel: undefined, page: undefined })} />
              {EDUCATION_LEVELS.map((l) => (
                <FilterPill
                  key={l.value}
                  label={l.label}
                  active={educationLevel === l.value}
                  onClick={() => updateParams({ educationLevel: educationLevel === l.value ? undefined : l.value, page: undefined })}
                />
              ))}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-cream-100/40 font-medium">Category:</span>
              <FilterPill label="All" active={!eligibleCategory} onClick={() => updateParams({ eligibleCategory: undefined, page: undefined })} />
              {ELIGIBLE_CATEGORIES.map((c) => (
                <FilterPill
                  key={c.value}
                  label={c.label}
                  active={eligibleCategory === c.value}
                  onClick={() => updateParams({ eligibleCategory: eligibleCategory === c.value ? undefined : c.value, page: undefined })}
                />
              ))}
            </div>

            {/* Gender + State */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-cream-100/40 font-medium">For:</span>
              {GENDER_OPTIONS.map((g) => (
                <FilterPill
                  key={g.value}
                  label={g.label}
                  active={gender === g.value}
                  onClick={() => updateParams({ gender: gender === g.value || g.value === 'any' ? undefined : g.value, page: undefined })}
                />
              ))}

              <span className="text-xs text-cream-100/20 mx-2">|</span>
              <span className="text-xs text-cream-100/40 font-medium">State:</span>
              <select
                value={state}
                onChange={(e) => updateParams({ state: e.target.value || undefined, page: undefined })}
                className="px-3 py-1.5 rounded-full bg-night-800 border border-cream-100/10 text-cream-100/70 text-xs focus:border-gold-500 focus:outline-none"
              >
                <option value="">All India</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-2 px-3 py-1.5 rounded-full text-xs text-red-300/70 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {loadingList ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ScholarshipCardSkeleton />
              <ScholarshipCardSkeleton />
              <ScholarshipCardSkeleton />
              <ScholarshipCardSkeleton />
              <ScholarshipCardSkeleton />
              <ScholarshipCardSkeleton />
            </div>
          ) : listError ? (
            <div className="text-center py-16 border border-cream-100/5 rounded-2xl bg-night-800/40">
              <p className="text-cream-100/70 text-sm mb-3">Unable to load scholarships right now.</p>
              <button
                onClick={() => updateParams({})}
                className="px-5 py-2.5 rounded-lg border border-gold-500/40 text-gold-400 text-sm hover:bg-gold-500/10 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border border-cream-100/5 rounded-2xl bg-night-800/40">
              <div className="w-16 h-16 rounded-full bg-night-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cream-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-cream-100/60 text-base mb-2">No matching scholarships</p>
              <p className="text-cream-100/40 text-sm mb-6">Try removing some filters or broadening your search.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-lg bg-gold-500 text-night-900 text-sm font-medium hover:bg-gold-400 transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((s) => (
                  <ScholarshipCard key={s._id} s={s} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => updateParams({ page: page > 1 ? String(page - 1) : undefined })}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-cream-100/10 text-cream-100/70 text-sm hover:border-cream-100/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <span className="px-4 py-2 text-cream-100/60 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateParams({ page: page < totalPages ? String(page + 1) : undefined })}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg border border-cream-100/10 text-cream-100/70 text-sm hover:border-cream-100/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Footnote */}
        <div className="mt-16 pt-8 border-t border-cream-100/5">
          <p className="text-cream-100/30 text-xs leading-relaxed max-w-3xl">
            EasyToFindEdu lists scholarships from official government, university, and recognized-foundation sources. We do not run an automated scraper and we do not own the data — we link you to the official application page on the provider's website. Deadlines and amounts can change from year to year, so always confirm the latest information on the official source before applying.
          </p>
        </div>
      </div>
    </div>
  );
}
