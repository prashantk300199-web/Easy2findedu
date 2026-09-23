import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoadmap, savePath, type Roadmap } from '../../services/career.service';
import { Spinner } from '../../components/primitives';

const STATUS_COLORS = {
  pursuing: { bg: 'bg-gold-500/10', border: 'border-gold-500/40', text: 'text-gold-700', dot: 'bg-gold-500 animate-pulse', label: 'In Progress' },
  decided: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Decided' },
  exploring: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Exploring' },
  interested: { bg: 'bg-night-100/50', border: 'border-night-200/50', text: 'text-night-700/60', dot: 'bg-night-400', label: 'Saved' },
  null: { bg: 'bg-night-100/30', border: 'border-night-200/30', text: 'text-night-600/50', dot: 'bg-night-300', label: 'Not Started' },
};

const PHASE_ICONS: Record<string, string> = {
  Foundation: '🎓',
  Skills: '📚',
  Practice: '⚙️',
  Projects: '🚀',
  Portfolio: '💼',
  Experience: '🏢',
  'Career Preparation': '🎯',
};

export default function CareerRoadmapPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    if (!nodeId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getRoadmap(nodeId);
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => { fetchRoadmap(); }, [fetchRoadmap]);

  const handleStatusUpdate = async (nid: string, status: string) => {
    setUpdatingId(nid);
    try {
      await savePath(nid, status);
      await fetchRoadmap();
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500/70 text-sm mb-4">{error || 'Roadmap not found'}</p>
          <button onClick={fetchRoadmap} className="text-sm text-night-700/60 hover:text-night-700 underline">Try again</button>
        </div>
      </div>
    );
  }

  // Compute totals
  let totalDuration = 0;
  roadmap.phases.forEach((phase) => {
    phase.nodes.forEach((n) => {
      if (n.duration?.value) totalDuration += n.duration.value;
    });
  });

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-night-900 py-12 md:py-16">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <p className="text-gold-500/70 text-sm font-mono tracking-widest mb-2">CAREER ROADMAP</p>
          <h1 className="font-display text-d3 text-cream-100 mb-2">{roadmap.targetTitle}</h1>
          <p className="text-cream-100/50 text-sm">
            {roadmap.totalNodes} step{roadmap.totalNodes !== 1 ? 's' : ''} to reach your goal
          </p>
          {/* Summary stats */}
          <div className="flex flex-wrap gap-6 mt-5">
            {totalDuration > 0 && (
              <div>
                <p className="text-xs text-cream-100/30">Total Duration</p>
                <p className="text-sm text-cream-100/80 font-medium">
                  {totalDuration >= 12 ? `${(totalDuration / 12).toFixed(1)} years` : `${totalDuration} months`}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-cream-100/30">Career Phases</p>
              <p className="text-sm text-cream-100/80 font-medium">{roadmap.phases.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">

          {/* Timeline */}
          <div className="relative">
            {roadmap.phases.map((phase, phaseIdx) => (
              <div key={phase.phase} className="mb-8">
                {/* Phase header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-night-800 flex items-center justify-center text-cream-100 text-lg flex-shrink-0">
                    {PHASE_ICONS[phase.phase] || '📌'}
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-night-800">{phase.phase}</h2>
                    <p className="text-xs text-night-600/50">{phase.nodes.length} step{phase.nodes.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Phase steps */}
                <div className="relative ml-5 border-l-2 border-night-200/60 pl-7 space-y-4">
                  {phase.nodes.map((node, nodeIdx) => {
                    const status = (node as { pathStatus?: string | null }).pathStatus;
                    const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.null;
                    const isLast = nodeIdx === phase.nodes.length - 1 && phaseIdx === roadmap.phases.length - 1;

                    return (
                      <div key={node._id} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[2.1rem] top-4 w-4 h-4 rounded-full border-2 border-cream ${colors.dot}`} />

                        {/* Node card */}
                        <div className={`rounded-xl p-5 border ${colors.bg} ${colors.border} transition-all`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-night-800 text-sm truncate">{node.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${colors.bg} ${colors.text} border ${colors.border}`}>
                                  {colors.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-night-600/50">
                                {node.duration?.value && (
                                  <span>⏱ {node.duration.value} {node.duration.unit || 'months'}</span>
                                )}
                                {node.difficultyLevel && (
                                  <span className="capitalize">{node.difficultyLevel.replace('_', ' ')}</span>
                                )}
                              </div>
                              {node.description && (
                                <p className="text-xs text-night-700/60 mt-2 line-clamp-2">{node.description}</p>
                              )}
                            </div>
                            <Link
                              to={`/career-explorer/${node._id}`}
                              className="flex-shrink-0 text-night-600/30 hover:text-night-700/60 transition-colors"
                              title="View details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          </div>

                          {/* Status update buttons */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-night-200/20">
                            <span className="text-xs text-night-600/40 mr-1">Update:</span>
                            {['Not Started', 'In Progress', 'Completed'].map((label) => {
                              const val = label === 'Not Started' ? null : label === 'In Progress' ? 'pursuing' : 'completed';
                              const isActive = status === val || (val === null && !status);
                              return (
                                <button
                                  key={label}
                                  onClick={() => handleStatusUpdate(node._id, val || 'interested')}
                                  disabled={updatingId === node._id}
                                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                                    isActive
                                      ? 'bg-night-800 text-cream-100 border-night-800 cursor-default'
                                      : 'border-night-200 text-night-600/60 hover:border-night-400 hover:text-night-800'
                                  }`}
                                >
                                  {updatingId === node._id && isActive ? '...' : label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-28 bg-night-100 rounded-2xl p-6 border border-night-200/40">
              <h3 className="font-display text-base text-night-800 mb-4">Roadmap Summary</h3>
              <div className="space-y-4 mb-6">
                {roadmap.phases.map((phase) => {
                  const completed = phase.nodes.filter((n) => (n as { pathStatus?: string | null }).pathStatus === 'completed').length;
                  const total = phase.nodes.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div key={phase.phase}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-night-700/60">{phase.phase}</span>
                        <span className="text-xs text-night-700/40">{completed}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-night-200/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <Link
                  to={`/career-explorer/${nodeId}`}
                  className="block w-full px-4 py-3 rounded-xl bg-night-800 text-cream-100 text-sm font-medium text-center hover:bg-night-900 transition-colors"
                >
                  View Career Details →
                </Link>
                <Link
                  to="/career-explorer"
                  className="block w-full px-4 py-3 rounded-xl border border-night-200 text-night-700/70 text-sm font-medium text-center hover:bg-night-100/40 transition-colors"
                >
                  Browse More Careers
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
