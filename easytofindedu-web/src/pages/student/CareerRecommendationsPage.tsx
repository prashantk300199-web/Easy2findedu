import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getRecommendations, savePath, type Recommendation } from '../../services/career.service';
import { CareerNodeCard } from '../../components/career/CareerNodeCard';
import { Spinner } from '../../components/primitives';

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 50 ? '#C9A96A' : '#EF4444';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-night-600/60">Profile Match</span>
        <span className="text-sm font-mono font-semibold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-night-200/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

function WhyAppeared({ rec }: { rec: Recommendation }) {
  const reasons: string[] = [];
  const d = rec.scoringDetails;
  if (d?.qualificationMatch === 'yes') reasons.push('Your education level matches the eligibility');
  if (d?.streamMatch === 'yes') reasons.push('Your stream is well-suited for this path');
  if (d?.financialFit === 'yes') reasons.push('Within your budget range');
  if (d?.regionMatch === 'yes') reasons.push('Available in your preferred location');
  if (d?.timeframeMatch === 'yes') reasons.push('Fits your career timeline');
  if (reasons.length === 0) reasons.push('A strong overall match based on your profile');

  return (
    <div>
      <p className="text-xs text-night-600/50 font-medium mb-1.5">Why this appeared</p>
      <ul className="space-y-1">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-night-700/70">
            <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillGaps({ rec }: { rec: Recommendation }) {
  // Gaps are nodes with required keywords that aren't in student's skills
  const gaps: string[] = [];
  const tags = rec.tags || rec.keywords || [];
  // Show top 5 tags as potential gaps
  if (tags.length > 0) {
    gaps.push(...tags.slice(0, 5).map((t) => t.charAt(0).toUpperCase() + t.slice(1)));
  }
  if (gaps.length === 0) return null;

  return (
    <div>
      <p className="text-xs text-night-600/50 font-medium mb-1.5">Areas to develop</p>
      <div className="flex flex-wrap gap-1.5">
        {gaps.map((g) => (
          <span key={g} className="px-2.5 py-1 rounded-full text-xs bg-amber-50 border border-amber-200 text-amber-700">
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CareerRecommendationsPage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const recs = await getRecommendations(15);
      setRecommendations(recs);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Complete questionnaire')) {
        setError('questionnaire');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecommendations(); }, []);

  const handleSave = (nodeId: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(nodeId);
      else next.delete(nodeId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error === 'questionnaire') {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-page mx-auto px-6 md:px-12 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="font-display text-d3 text-night-800 mb-3">Complete Your Profile First</h1>
          <p className="text-night-700/60 text-base max-w-md mx-auto mb-8">
            We need a few details about your academics, interests, and preferences to generate personalized recommendations.
          </p>
          <Link
            to="/career-guidance"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-night-800 text-cream-100 text-sm font-medium hover:bg-night-900 transition-colors"
          >
            Take the questionnaire →
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500/70 text-sm mb-4">{error}</p>
          <button onClick={fetchRecommendations} className="text-sm text-night-700/60 hover:text-night-700 underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-page mx-auto px-6 md:px-12 py-24 text-center">
          <h1 className="font-display text-d3 text-night-800 mb-3">No Recommendations Yet</h1>
          <p className="text-night-700/60 text-base max-w-md mx-auto mb-8">
            We're still building up our career database. Check back soon or browse careers directly.
          </p>
          <Link
            to="/career-explorer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-night-800 text-cream-100 text-sm font-medium hover:bg-night-900 transition-colors"
          >
            Browse Careers →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-night-900 py-14 md:py-20">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <p className="text-gold-500/70 text-sm font-mono tracking-widest mb-3">CAREER RECOMMENDATIONS</p>
          <h1 className="font-display text-d2 text-cream-100 mb-4">Careers For You</h1>
          <p className="text-cream-100/50 text-base max-w-xl">
            Based on your profile, academics, interests, and preferences. Each match shows why it appeared and what to work on next.
          </p>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10">
        {/* Top picks grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 mb-16">
          {recommendations.slice(0, 8).map((rec) => (
            <CareerNodeCard
              key={rec._id}
              node={rec}
              matchScore={rec.matchScore}
              isSaved={savedIds.has(rec._id)}
              onSaveToggle={handleSave}
            />
          ))}
        </div>

        {/* Detailed recommendations */}
        <h2 className="font-display text-d4 text-night-800 mb-8">Detailed Breakdown</h2>
        <div className="space-y-6">
          {recommendations.map((rec, i) => (
            <div
              key={rec._id}
              className="bg-night-100 rounded-2xl p-6 md:p-8 border border-night-200/50"
            >
              <div className="flex items-start gap-6">
                {/* Number + title */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <span className="font-mono text-gold-700 font-semibold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-display text-xl text-night-800 mb-1">{rec.title}</h3>
                      <p className="text-night-600/50 text-sm capitalize">
                        {rec.nodeType?.replace('_', ' ')}
                      </p>
                    </div>
                    <Link
                      to={`/career-explorer/${rec._id}`}
                      className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-night-800 text-cream-100 text-xs font-medium hover:bg-night-900 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>

                  <ScoreBar score={rec.matchScore} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    <WhyAppeared rec={rec} />
                    <SkillGaps rec={rec} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={async () => {
                        try {
                          await savePath(rec._id, 'decided');
                          handleSave(rec._id, true);
                        } catch { /* ignore */ }
                      }}
                      disabled={savedIds.has(rec._id)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        savedIds.has(rec._id)
                          ? 'bg-gold-500/10 text-gold-700 border border-gold-500/20 cursor-default'
                          : 'bg-gold-500 text-night-900 hover:bg-gold-600 cursor-pointer'
                      }`}
                    >
                      {savedIds.has(rec._id) ? '✓ Saved' : 'I\'m Sure →'}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await savePath(rec._id, 'exploring');
                          handleSave(rec._id, true);
                        } catch { /* ignore */ }
                      }}
                      disabled={savedIds.has(rec._id)}
                      className="px-5 py-2.5 rounded-lg border border-night-300 text-night-700 text-xs font-medium hover:bg-night-200/30 transition-all disabled:opacity-50"
                    >
                      Maybe Later
                    </button>
                    <Link
                      to={`/career/compare?compare=${rec._id}`}
                      className="ml-auto text-xs text-night-600/50 hover:text-night-700 transition-colors"
                    >
                      Compare ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
