import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNodeDetail, savePath, type CareerNode } from '../../services/career.service';
import { CareerNodeCard } from '../../components/career/CareerNodeCard';
import { Spinner } from '../../components/primitives';

const TABS = ['Overview', 'Roadmap', 'Skills & Subjects', 'Career Pathways', 'Institutions', 'Compare'];

function TabNav({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="sticky top-[76px] z-20 bg-cream border-b border-cream-200">
      <div className="max-w-page mx-auto px-6 md:px-12">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                onChange(tab);
                document.getElementById(tab.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-5 py-4 text-sm whitespace-nowrap border-b-2 transition-all ${
                active === tab
                  ? 'border-night-800 text-night-800 font-medium'
                  : 'border-transparent text-night-600/50 hover:text-night-800/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function mathProgrammingIntensity(tags: string[] = []): string {
  const combined = tags.join(' ').toLowerCase();
  if (/programming|coding|software|ml|ai|data science|computer|engineering/i.test(combined)) return 'High';
  if (/mathematics|statistics|quantitative|analysis/i.test(combined)) return 'Medium';
  return 'Low';
}

export default function CareerExplorerDetailPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [node, setNode] = useState<CareerNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const fetchNode = useCallback(async () => {
    if (!nodeId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getNodeDetail(nodeId);
      setNode(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load career details');
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => { fetchNode(); }, [fetchNode]);

  const handleSave = async () => {
    if (!node || saving) return;
    setSaving(true);
    try {
      await savePath(node._id, saved ? undefined : 'interested');
      setSaved(!saved);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500/70 text-sm mb-4">{error || 'Career not found'}</p>
          <button onClick={fetchNode} className="text-sm text-night-700/60 hover:text-night-700 underline">Try again</button>
        </div>
      </div>
    );
  }

  const mathLevel = mathProgrammingIntensity(node.tags);

  return (
    <div className="min-h-screen bg-cream">
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* Hero */}
      <div className="bg-night-900 py-14 md:py-20">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs bg-cream-100/10 text-gold-500/80 border border-gold-500/20 mb-4 capitalize">
                {node.nodeType?.replace('_', ' ')}
              </span>
              <h1 className="font-display text-d2 text-cream-100 mb-3">{node.title}</h1>
              {node.description && (
                <p className="text-cream-100/50 text-base max-w-2xl leading-relaxed">{node.description}</p>
              )}
              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-6 mt-6">
                {node.duration?.value && (
                  <div>
                    <p className="text-xs text-cream-100/30 mb-0.5">Duration</p>
                    <p className="text-sm text-cream-100/80 font-medium">{node.duration.value} {node.duration.unit || 'months'}</p>
                  </div>
                )}
                {node.difficultyLevel && (
                  <div>
                    <p className="text-xs text-cream-100/30 mb-0.5">Difficulty</p>
                    <p className="text-sm text-cream-100/80 font-medium capitalize">{node.difficultyLevel.replace('_', ' ')}</p>
                  </div>
                )}
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {node.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs bg-cream-100/10 text-cream-100/60 border border-cream-100/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Sticky sidebar actions */}
            <div className="hidden lg:flex flex-col gap-3 w-56 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-gold-500 text-night-900 hover:bg-gold-600'
                    : 'bg-cream-100/10 border border-gold-500/40 text-gold-500 hover:bg-gold-500/10'
                }`}
              >
                {saving ? <Spinner size="sm" /> : saved ? '✓ Saved' : '☆ Save Career'}
              </button>
              <Link
                to={`/career/roadmap/${node._id}`}
                className="w-full px-5 py-3 rounded-xl text-sm font-medium bg-gold-500 text-night-900 hover:bg-gold-600 text-center transition-colors"
              >
                View Roadmap →
              </Link>
              <Link
                to={`/career/compare?compare=${node._id}`}
                className="w-full px-5 py-3 rounded-xl text-sm font-medium border border-cream-100/20 text-cream-100/70 hover:bg-cream-100/10 text-center transition-colors"
              >
                Compare Careers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-page mx-auto px-6 md:px-12 py-10">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">

          {/* Main content */}
          <div className="space-y-16">

            {/* Overview */}
            <section id="overview">
              {node.overview && (
                <div className="mb-8">
                  <h2 className="font-display text-d4 text-night-800 mb-4">Overview</h2>
                  <p className="text-night-700/70 text-base leading-relaxed">{node.overview}</p>
                </div>
              )}
              {node.eligibility && (
                <div className="bg-night-100 rounded-xl p-6">
                  <h3 className="font-display text-lg text-night-800 mb-4">Eligibility</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {(node.eligibility?.qualifications?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-night-600/50 mb-1">Qualification</p>
                        <p className="text-night-800">{node.eligibility.qualifications.join(', ')}</p>
                      </div>
                    )}
                    {(node.eligibility?.streams?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-night-600/50 mb-1">Streams</p>
                        <p className="text-night-800 capitalize">{node.eligibility.streams.join(', ')}</p>
                      </div>
                    )}
                    {node.eligibility.minPercentage && (
                      <div>
                        <p className="text-night-600/50 mb-1">Min. Percentage</p>
                        <p className="text-night-800">{node.eligibility.minPercentage}%</p>
                      </div>
                    )}
                    {node.eligibility.otherRequirements && (
                      <div className="col-span-2">
                        <p className="text-night-600/50 mb-1">Other Requirements</p>
                        <p className="text-night-800">{node.eligibility.otherRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Roadmap */}
            <section id="roadmap">
              <h2 className="font-display text-d4 text-night-800 mb-4">Your Roadmap</h2>
              <p className="text-night-700/60 text-sm mb-5">See the personalized path from where you are to this career.</p>
              <Link
                to={`/career/roadmap/${node._id}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-night-800 text-cream-100 text-sm font-medium hover:bg-night-900 transition-colors"
              >
                View My Roadmap →
              </Link>
            </section>

            {/* Skills & Subjects */}
            <section id="skills-&-subjects">
              <h2 className="font-display text-d4 text-night-800 mb-4">Skills & Subjects</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-night-600/50 font-medium mb-3">Math / Programming Intensity</p>
                  <div className="space-y-2">
                    {['Low', 'Medium', 'High'].map((level) => (
                      <div key={level} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${mathLevel === level ? 'bg-emerald-50 border border-emerald-200' : 'bg-night-100/30 border border-night-200/30'}`}>
                        <div className={`w-3 h-3 rounded-full ${mathLevel === level ? 'bg-emerald-500' : 'bg-night-300'}`} />
                        <span className={`text-sm font-medium ${mathLevel === level ? 'text-emerald-800' : 'text-night-600/40'}`}>{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {node.tags && node.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-night-600/50 font-medium mb-3">Related Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {node.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full bg-night-100/60 border border-night-200/50 text-night-700/70 text-xs capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Career Outcomes */}
            <section id="career-outcomes">
              <h2 className="font-display text-d4 text-night-800 mb-4">Career Pathways</h2>
              {/* Eligibility */}
              {node.eligibility && (
                <div className="mb-6">
                  <p className="text-xs text-night-600/50 font-medium mb-2">Eligibility</p>
                  {(node.eligibility?.qualifications?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(node.eligibility?.qualifications ?? []).map((q) => (
                        <span key={q} className="px-3 py-1 rounded-full text-xs bg-night-100 border border-night-200/40 text-night-700 capitalize">
                          {q.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  {(node.eligibility?.streams?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(node.eligibility?.streams ?? []).map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full text-xs bg-gold-50 border border-gold-200/40 text-gold-700 capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {node.eligibility.minPercentage && (
                    <p className="text-xs text-night-600/40 mt-2">Min. required percentage: {node.eligibility.minPercentage}%</p>
                  )}
                </div>
              )}
              {/* Tags / Skills */}
              {node.tags && node.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-night-600/50 font-medium mb-2">Related Skills & Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {node.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs bg-cream-100 border border-cream-200 text-night-700/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Difficulty */}
              {node.difficultyLevel && (
                <div className="mb-6">
                  <p className="text-xs text-night-600/50 font-medium mb-2">Difficulty Level</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-amber-50 border border-amber-200 text-amber-700 capitalize">
                    {node.difficultyLevel.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              {/* Duration */}
              {node.duration?.value && (
                <div className="mb-6">
                  <p className="text-xs text-night-600/50 font-medium mb-2">Typical Duration</p>
                  <p className="text-sm text-night-800">{node.duration.value} {node.duration.unit || 'years'}</p>
                </div>
              )}
              {/* Roadmap link */}
              <div className="mt-6 p-5 rounded-xl bg-night-100 border border-night-200/40">
                <p className="text-sm text-night-700/80 mb-3">See the full education and career roadmap from Class 10 through to this destination.</p>
                <Link
                  to={`/career/roadmap/${node._id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-night-800 text-cream-100 text-sm font-medium hover:bg-night-900 transition-colors"
                >
                  View Full Roadmap →
                </Link>
              </div>
            </section>

            {/* Institutions */}
            <section id="institutions">
              <h2 className="font-display text-d4 text-night-800 mb-4">Top Institutions</h2>
              {node.topInstitutions && node.topInstitutions.length > 0 ? (
                <div className="space-y-3">
                  {node.topInstitutions.map((inst, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-night-100 rounded-xl border border-night-200/40">
                      <div className="w-10 h-10 rounded-lg bg-night-200/40 flex items-center justify-center text-night-600/40 font-mono text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-night-800 text-sm truncate">{inst.name}</p>
                        {inst.location && <p className="text-xs text-night-600/50">{inst.location}</p>}
                      </div>
                      {inst.cutoff && <span className="text-xs text-night-600/40 flex-shrink-0">Cutoff: {inst.cutoff}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-night-600/40 text-sm">No institution data available for this career yet.</p>
              )}
              <Link to="/colleges" className="inline-flex items-center gap-2 mt-4 text-sm text-night-700/60 hover:text-night-800 transition-colors">
                Browse all colleges →
              </Link>
            </section>

            {/* Compare */}
            <section id="compare">
              <h2 className="font-display text-d4 text-night-800 mb-4">Compare Careers</h2>
              <p className="text-night-700/60 text-sm mb-5">See how this compares to other careers you're exploring.</p>
              <Link
                to={`/career/compare?compare=${node._id}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-night-800 text-cream-100 text-sm font-medium hover:bg-night-900 transition-colors"
              >
                Compare with Other Careers →
              </Link>
            </section>

          </div>

          {/* Mobile sticky actions */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-cream border-t border-cream-200 p-4 flex gap-3 shadow-lg">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                saved ? 'bg-gold-500 text-night-900' : 'bg-night-100 border border-night-200 text-night-800'
              }`}
            >
              {saved ? '✓ Saved' : '☆ Save'}
            </button>
            <Link to={`/career/roadmap/${node._id}`} className="flex-1 px-4 py-3 rounded-xl bg-night-800 text-cream-100 text-sm font-medium text-center">
              Roadmap →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
