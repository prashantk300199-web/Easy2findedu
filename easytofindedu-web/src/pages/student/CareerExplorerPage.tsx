import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNodes, type CareerNode } from '../../services/career.service';
import { CareerNodeCard } from '../../components/career/CareerNodeCard';
import { Spinner } from '../../components/primitives';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'quickest', label: 'Quickest' },
  { value: 'newest', label: 'Newest' },
];

const AREAS: { id: string; label: string }[] = [
  { id: 'technology', label: 'Technology' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'commerce_finance', label: 'Commerce & Finance' },
  { id: 'law', label: 'Law' },
  { id: 'creative', label: 'Creative Arts' },
  { id: 'business', label: 'Business' },
  { id: 'research', label: 'Research' },
  { id: 'public_service', label: 'Public Service' },
];

const DIFFICULTIES = ['easy', 'moderate', 'hard', 'very_hard'];

const QUALIFICATIONS = [
  { value: 'class_10th', label: 'Class 10' },
  { value: 'class_12th', label: 'Class 12' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: 'Bachelor\'s' },
  { value: 'master', label: 'Master\'s' },
];

export default function CareerExplorerPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [nodes, setNodes] = useState<CareerNode[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchNodes = useCallback(async (resetPage = false) => {
    if (resetPage) setPage(1);
    setLoading(true);
    setError('');
    try {
      const res = await getNodes({
        query: selectedArea || query || undefined,
        qualification: selectedQualification || undefined,
        difficulty: selectedDifficulty || undefined,
        sortBy,
        page: resetPage ? 1 : page,
        limit: 24,
      });
      if (resetPage) {
        setNodes(res.nodes);
      } else {
        setNodes((prev) => [...prev, ...res.nodes]);
      }
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load careers');
    } finally {
      setLoading(false);
    }
  }, [query, selectedQualification, selectedDifficulty, sortBy, page]);

  useEffect(() => { fetchNodes(true); }, [selectedArea, selectedQualification, selectedDifficulty, sortBy]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => fetchNodes(true), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const loadMore = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  useEffect(() => {
    if (page > 1) fetchNodes(false);
  }, [page]);

  const clearFilters = () => {
    setSelectedArea('');
    setSelectedQualification('');
    setSelectedDifficulty('');
    setSortBy('popular');
    setQuery('');
  };

  const hasFilters = selectedQualification || selectedDifficulty || query;

  return (
    <div className="min-h-screen bg-cream">
      {/* Page hero */}
      <div className="bg-night-900 py-14 md:py-20">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <p className="text-gold-500/70 text-sm font-mono tracking-widest mb-3">CAREER EXPLORER</p>
          <h1 className="font-display text-d2 text-cream-100 mb-4">Find Your Right Career</h1>
          <p className="text-cream-100/50 text-base max-w-xl">
            Browse careers, compare options, and build a roadmap — all backed by your profile.
          </p>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10">
        {/* Search + Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-night-600/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search careers, courses, skills..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-night-100 border border-night-200 text-night-800 text-sm focus:border-gold-500 focus:outline-none placeholder:text-night-600/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-night-200 text-night-700 text-sm hover:border-night-400 transition-colors md:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-8 space-y-4`}>
          {/* Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-night-600/50 font-medium">Sort:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                  sortBy === opt.value
                    ? 'border-gold-500 bg-gold-500/10 text-gold-700'
                    : 'border-night-200 text-night-600/60 hover:border-night-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Career Areas */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-night-600/50 font-medium">Area:</span>
            <button
              onClick={() => setSelectedArea('')}
              className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                !selectedArea ? 'border-night-800 bg-night-800 text-cream-100' : 'border-night-200 text-night-600/60 hover:border-night-400'
              }`}
            >
              All
            </button>
            {AREAS.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedArea(selectedArea === a.id ? '' : a.id)}
                className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                  selectedArea === a.id
                    ? 'border-night-800 bg-night-800 text-cream-100'
                    : 'border-night-200 text-night-600/60 hover:border-night-400'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Qualification + Difficulty */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-night-600/50 font-medium">Level:</span>
            {QUALIFICATIONS.map((q) => (
              <button
                key={q.value}
                onClick={() => setSelectedQualification(selectedQualification === q.value ? '' : q.value)}
                className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                  selectedQualification === q.value
                    ? 'border-night-800 bg-night-800 text-cream-100'
                    : 'border-night-200 text-night-600/60 hover:border-night-400'
                }`}
              >
                {q.label}
              </button>
            ))}
            <span className="text-xs text-night-600/30">|</span>
            <span className="text-xs text-night-600/50 font-medium">Difficulty:</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                className={`px-4 py-1.5 rounded-full text-xs border transition-all capitalize ${
                  selectedDifficulty === d
                    ? 'border-night-800 bg-night-800 text-cream-100'
                    : 'border-night-200 text-night-600/60 hover:border-night-400'
                }`}
              >
                {d.replace('_', ' ')}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-1.5 rounded-full text-xs text-red-500/60 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && total > 0 && (
          <p className="text-sm text-night-600/50 mb-6">
            {total} career{total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        {loading && nodes.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500/70 text-sm mb-4">{error}</p>
            <button onClick={() => fetchNodes(true)} className="text-sm text-night-700/60 hover:text-night-700 underline">
              Try again
            </button>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-night-100/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-night-600/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-night-700/50 text-base mb-2">No careers match your filters</p>
            <p className="text-night-600/40 text-sm mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-lg bg-night-800 text-cream-100 text-sm hover:bg-night-900 transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {nodes.map((node) => (
                <CareerNodeCard key={node._id} node={node} />
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div className="text-center mt-14">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-3.5 rounded-xl border border-night-200 text-night-700 text-sm hover:border-night-400 hover:bg-night-100/30 transition-all disabled:opacity-50"
                >
                  {loading ? <Spinner size="sm" /> : `Load more (${total - nodes.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
