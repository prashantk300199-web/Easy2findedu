import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { compareNodes, savePath, type CareerNode } from '../../services/career.service';
import { Spinner } from '../../components/primitives';

function mathLevel(tags: string[] = []): 'Low' | 'Medium' | 'High' {
  const combined = (tags || []).join(' ').toLowerCase();
  if (/programming|coding|software|ml|ai|data science|computer|engineering/i.test(combined)) return 'High';
  if (/mathematics|statistics|quantitative|analysis/i.test(combined)) return 'Medium';
  return 'Low';
}

const ROWS = [
  { key: 'difficultyLevel', label: 'Difficulty', render: (v: string) => v ? <span className="capitalize">{v.replace('_', ' ')}</span> : null },
  { key: 'duration', label: 'Duration', render: (v: CareerNode['duration']) => v ? `${v.value} ${v.unit || 'months'}` : null },
  { key: 'mathLevel', label: 'Math / Programming', isTag: true },
];

export default function CareerComparePage() {
  const [searchParams] = useSearchParams();
  const compareParam = searchParams.get('compare') || '';
  const ids = compareParam.split(',').filter(Boolean);

  const [nodes, setNodes] = useState<CareerNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompare = useCallback(async () => {
    if (ids.length === 0) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await compareNodes(ids);
      setNodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare careers');
    } finally {
      setLoading(false);
    }
  }, [ids.join(',')]);

  useEffect(() => { fetchCompare(); }, [fetchCompare]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-night-700/60 text-sm mb-4">Select careers to compare from the career explorer.</p>
          <Link to="/career-explorer" className="text-sm text-night-700 hover:text-night-800 underline">Browse careers →</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500/70 text-sm mb-4">{error}</p>
          <button onClick={fetchCompare} className="text-sm text-night-700/60 hover:text-night-700 underline">Try again</button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-night-700/60 text-sm mb-4">No careers found for comparison.</p>
          <Link to="/career-explorer" className="text-sm text-night-700 hover:text-night-800 underline">Browse careers →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-night-900 py-12 md:py-16">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <p className="text-gold-500/70 text-sm font-mono tracking-widest mb-2">CAREER COMPARISON</p>
          <h1 className="font-display text-d3 text-cream-100 mb-3">Compare Careers</h1>
          <p className="text-cream-100/50 text-sm">
            {nodes.length} career{nodes.length !== 1 ? 's' : ''} selected. No single career is universally "best" — the right choice depends on your unique profile.
          </p>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left py-4 pr-6 text-xs text-night-600/50 font-medium w-48 sticky left-0 bg-cream z-10">Attribute</th>
              {nodes.map((node) => (
                <th key={node._id} className="py-4 px-4 text-center min-w-[200px]">
                  <div className="bg-night-100 rounded-xl p-4 border border-night-200/50 h-full">
                    <p className="font-display text-base text-night-800 leading-snug mb-1">{node.title}</p>
                    <p className="text-xs text-night-600/50 capitalize">{node.nodeType?.replace('_', ' ')}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <Link
                        to={`/career-explorer/${node._id}`}
                        className="w-full px-3 py-2 rounded-lg bg-night-800 text-cream-100 text-xs font-medium text-center hover:bg-night-900 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={async () => {
                          try { await savePath(node._id, 'pursuing'); } catch { /* ignore */ }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gold-500/40 text-gold-700 text-xs font-medium hover:bg-gold-50 transition-colors"
                      >
                        Choose This
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Stream */}
            <tr className="border-t border-night-200/30">
              <td className="py-4 pr-6 text-sm text-night-700/60 font-medium sticky left-0 bg-cream z-10">Education</td>
              {nodes.map((node) => (
                <td key={node._id} className="py-4 px-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-night-100/60 border border-night-200/40 text-night-700/70 text-sm capitalize">
                    {node.eligibility?.qualifications?.join(', ') || node.nodeType?.replace('_', ' ')}
                  </span>
                </td>
              ))}
            </tr>
            {/* Stream requirement */}
            <tr className="border-t border-night-200/30">
              <td className="py-4 pr-6 text-sm text-night-700/60 font-medium sticky left-0 bg-cream z-10">Stream</td>
              {nodes.map((node) => (
                <td key={node._id} className="py-4 px-4 text-center">
                  <span className="text-sm text-night-800 capitalize">
                    {node.eligibility?.streams?.join(', ') || '—'}
                  </span>
                </td>
              ))}
            </tr>
            {/* Math/Programming */}
            <tr className="border-t border-night-200/30">
              <td className="py-4 pr-6 text-sm text-night-700/60 font-medium sticky left-0 bg-cream z-10">Math / Programming</td>
              {nodes.map((node) => {
                const level = mathLevel(node.tags);
                const colors = { High: 'bg-red-50 text-red-700 border-red-200', Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200', Low: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                return (
                  <td key={node._id} className="py-4 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm border ${colors[level]}`}>{level}</span>
                  </td>
                );
              })}
            </tr>
            {/* Dynamic rows */}
            {ROWS.filter((r) => r.key !== 'mathLevel').map((row) => (
              <tr key={row.key} className="border-t border-night-200/30">
                <td className="py-4 pr-6 text-sm text-night-700/60 font-medium sticky left-0 bg-cream z-10">{row.label}</td>
                {nodes.map((node) => {
                  const value = (node as Record<string, unknown>)[row.key];
                  return (
                    <td key={node._id} className="py-4 px-4 text-center">
                      {row.render ? row.render(value as string | number) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom note */}
        <div className="mt-12 p-6 bg-night-100/60 rounded-xl border border-night-200/40">
          <p className="text-sm text-night-700/60">
            <strong className="text-night-800">Remember:</strong> No career is universally "better" than another. The right choice depends on your unique combination of interests, skills, constraints, and goals. Use this comparison as one input — not a decision engine.
          </p>
        </div>
      </div>
    </div>
  );
}
