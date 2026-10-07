import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getScholarship, trackScholarshipClick, type Scholarship } from '../../services/scholarship.service';
import { Spinner } from '../../components/primitives';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'OPEN', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  upcoming: { label: 'UPCOMING', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  closing_soon: { label: 'CLOSING SOON', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  closed: { label: 'CLOSED', className: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  expired: { label: 'EXPIRED', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
  unknown: { label: 'STATUS UNKNOWN', className: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE.unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-cream-100/5 last:border-0">
      <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-1">{label}</p>
      <div className="text-cream-100/80 text-sm">{value || '—'}</div>
    </div>
  );
}

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [s, setS] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getScholarship(id);
      setS(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load scholarship.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApply = useCallback(async () => {
    if (!s?.source?.officialApplicationUrl) return;
    try {
      await trackScholarshipClick(s._id);
    } catch {
      // Non-fatal
    }
    window.open(s.source.officialApplicationUrl, '_blank', 'noopener,noreferrer');
  }, [s]);

  if (loading) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !s) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-cream-100/70 text-base mb-3">{error || 'Scholarship not found.'}</p>
          <p className="text-cream-100/40 text-sm mb-6">
            The scholarship may have been removed, renamed, or its link may have changed.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-cream-100/15 text-cream-100/70 text-sm hover:border-cream-100/30"
            >
              ← Back
            </button>
            <Link
              to="/career/scholarships"
              className="px-5 py-2.5 rounded-lg bg-gold-500 text-night-900 text-sm font-medium hover:bg-gold-400"
            >
              All scholarships
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isClosedOrExpired = s.computedStatus === 'closed' || s.computedStatus === 'expired' || s.computedStatus === 'unknown';
  const e = s.eligibility || {};
  const d = s.deadline || {};

  return (
    <div className="min-h-screen bg-night-900">
      <div className="max-w-page mx-auto px-6 md:px-12 py-10 md:py-16">
        <Link
          to="/career/scholarships"
          className="text-xs text-cream-100/40 hover:text-gold-500 transition-colors mb-6 inline-block"
        >
          ← Back to scholarships
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider border border-cream-100/15 text-cream-100/70 bg-night-800/60">
              {(s.source?.sourceType || 'OTHER').toUpperCase()}
            </span>
            <StatusBadge status={s.computedStatus} />
            {s.isFeatured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider border border-gold-500/30 text-gold-300 bg-gold-500/10">
                FEATURED
              </span>
            )}
          </div>
          <h1 className="font-display text-d3 text-cream-100 mb-3 leading-tight">{s.name}</h1>
          <p className="text-cream-100/60 text-sm">
            by <span className="text-cream-100/80">{s.source?.sourceName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Main content */}
          <div className="space-y-8">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-night-800/60 border border-cream-100/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-1.5">Benefit</p>
                <p className="text-gold-400 font-medium text-sm leading-tight">{s.amountLabel || 'Amount not specified'}</p>
              </div>
              <div className="bg-night-800/60 border border-cream-100/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-1.5">Deadline</p>
                <p className="text-cream-100/80 text-sm leading-tight">{s.deadlineLabel || 'Not specified'}</p>
              </div>
              <div className="bg-night-800/60 border border-cream-100/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-1.5">Status</p>
                <div className="mt-0.5"><StatusBadge status={s.computedStatus} /></div>
              </div>
              <div className="bg-night-800/60 border border-cream-100/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-1.5">Type</p>
                <p className="text-cream-100/80 text-sm capitalize">{(s.scholarshipType || '').replace(/_/g, ' ') || '—'}</p>
              </div>
            </div>

            {/* Description */}
            {s.shortDescription && (
              <section>
                <h2 className="font-display text-d4 text-cream-100 mb-3">Overview</h2>
                <p className="text-cream-100/70 text-sm leading-relaxed">{s.shortDescription}</p>
              </section>
            )}

            {s.description && s.description !== s.shortDescription && (
              <section>
                <h2 className="font-display text-d4 text-cream-100 mb-3">Details</h2>
                <p className="text-cream-100/70 text-sm leading-relaxed whitespace-pre-line">{s.description}</p>
              </section>
            )}

            {/* Eligibility */}
            <section>
              <h2 className="font-display text-d4 text-cream-100 mb-3">Eligibility</h2>
              <div className="bg-night-800/40 border border-cream-100/5 rounded-2xl px-5">
                <InfoRow
                  label="Education Levels"
                  value={
                    e.educationLevels && e.educationLevels.length > 0
                      ? e.educationLevels.map((l) => l.replace('_', ' ').replace('class ', 'Class ')).join(', ')
                      : 'Any'
                  }
                />
                {e.streams && e.streams.length > 0 && (
                  <InfoRow
                    label="Eligible Streams"
                    value={e.streams.map((s) => s.toUpperCase()).join(', ')}
                  />
                )}
                {e.courses && e.courses.length > 0 && (
                  <InfoRow label="Eligible Courses" value={e.courses.join(', ')} />
                )}
                <InfoRow
                  label="Categories"
                  value={
                    e.categories && e.categories.length > 0
                      ? e.categories.map((c) => c.toUpperCase()).join(', ')
                      : 'Any'
                  }
                />
                {e.gender && e.gender !== 'any' && (
                  <InfoRow
                    label="Gender Eligibility"
                    value={e.gender === 'female_only' ? 'Women / Female only' : 'Men / Male only'}
                  />
                )}
                {e.states && e.states.length > 0 && (
                  <InfoRow label="State Eligibility" value={e.states.join(', ')} />
                )}
                {e.nationality && (
                  <InfoRow label="Nationality" value={e.nationality} />
                )}
                {e.minPercentage != null && (
                  <InfoRow label="Minimum Academic Score" value={`${e.minPercentage}%`} />
                )}
                {e.maxFamilyIncome != null && (
                  <InfoRow
                    label="Maximum Family Income (annual)"
                    value={`₹${e.maxFamilyIncome.toLocaleString('en-IN')}`}
                  />
                )}
                {e.minAge != null && <InfoRow label="Minimum Age" value={`${e.minAge} years`} />}
                {e.maxAge != null && <InfoRow label="Maximum Age" value={`${e.maxAge} years`} />}
                {e.disability && (
                  <InfoRow label="Disability" value="Reserved for persons with disabilities (PwD)" />
                )}
                {e.otherRequirements && (
                  <InfoRow label="Other Requirements" value={e.otherRequirements} />
                )}
              </div>
            </section>

            {/* Documents */}
            {s.requiredDocuments && s.requiredDocuments.length > 0 && (
              <section>
                <h2 className="font-display text-d4 text-cream-100 mb-3">Required Documents</h2>
                <ul className="space-y-2">
                  {s.requiredDocuments.map((doc, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-cream-100/70">
                      <svg className="w-4 h-4 text-gold-500/70 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Application process */}
            {s.applicationProcess && (
              <section>
                <h2 className="font-display text-d4 text-cream-100 mb-3">How to Apply</h2>
                <p className="text-cream-100/70 text-sm leading-relaxed whitespace-pre-line">{s.applicationProcess}</p>
              </section>
            )}

            {/* Deadline detail */}
            <section>
              <h2 className="font-display text-d4 text-cream-100 mb-3">Application Deadline</h2>
              <div className="bg-night-800/40 border border-cream-100/5 rounded-2xl px-5">
                {d.typicalWindow && (
                  <InfoRow label="Typical Application Window" value={d.typicalWindow} />
                )}
                {d.applicationStartDate && (
                  <InfoRow
                    label="Latest Open Date"
                    value={formatDate(d.applicationStartDate)}
                  />
                )}
                {d.applicationEndDate && (
                  <InfoRow
                    label="Latest Closing Date"
                    value={formatDate(d.applicationEndDate)}
                  />
                )}
                <InfoRow
                  label="Recurring Scheme"
                  value={d.isRecurring ? 'Yes — opens annually' : 'No — one-time scheme'}
                />
                {d.isExactDateConfirmed ? (
                  <InfoRow
                    label="Date Confirmation"
                    value="The date above is the latest confirmed date from the official source."
                  />
                ) : (
                  <InfoRow
                    label="Date Confirmation"
                    value="Dates shown reflect the typical annual window. Verify the current cycle dates on the official source before applying."
                  />
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-night-800/60 border border-cream-100/10 rounded-2xl p-6">
              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={isClosedOrExpired}
                className={`w-full px-5 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                  isClosedOrExpired
                    ? 'bg-night-700 text-cream-100/40 cursor-not-allowed'
                    : 'bg-gold-500 text-night-900 hover:bg-gold-400'
                }`}
              >
                {isClosedOrExpired
                  ? (s.computedStatus === 'upcoming' ? 'Opens later' : 'Application closed')
                  : 'Apply on Official Website →'}
              </button>
              <p className="text-[10px] text-cream-100/30 text-center mt-2">
                Opens the official provider's application page in a new tab.
              </p>

              <div className="my-5 h-px bg-cream-100/5" />

              <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-2">Source</p>
              <p className="text-cream-100/80 text-sm font-medium mb-1">{s.source?.sourceName}</p>
              <a
                href={s.source?.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold-400/80 hover:text-gold-300 inline-flex items-center gap-1 break-all"
              >
                Visit information page
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <div className="my-4 h-px bg-cream-100/5" />

              <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-1">Last verified</p>
              <p className="text-cream-100/80 text-sm">{formatLastVerified(s.source?.lastVerifiedAt)}</p>
              <p className="text-[10px] text-cream-100/30 mt-1">
                Scholarship information changes frequently. Always confirm the latest details on the official source.
              </p>

              {(s.source?.contactPhone || s.source?.contactEmail) && (
                <>
                  <div className="my-4 h-px bg-cream-100/5" />
                  <p className="text-[10px] uppercase tracking-wider text-cream-100/40 mb-2">Official Contact</p>
                  {s.source?.contactPhone && (
                    <p className="text-cream-100/80 text-xs mb-1">📞 {s.source.contactPhone}</p>
                  )}
                  {s.source?.contactEmail && (
                    <p className="text-cream-100/80 text-xs break-all">✉ {s.source.contactEmail}</p>
                  )}
                </>
              )}
            </div>

            {/* Reminder banner */}
            {!isClosedOrExpired && d.applicationEndDate && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  <strong className="text-amber-200">Tip:</strong> Don't wait until the last day. Server load and document uploads can cause delays. Start your application at least 7 days before the closing date.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
