import { useState } from 'react';
import { Link } from 'react-router-dom';
import { savePath } from '../../services/career.service';
import type { CareerNode } from '../../services/career.service';

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  moderate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hard: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  very_hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const NODE_TYPE_LABEL: Record<string, string> = {
  qualification: 'Qualification',
  stream_choice: 'Stream',
  entrance_exam: 'Entrance Exam',
  course: 'Degree',
  specialization: 'Specialization',
  professional_cert: 'Certification',
  career_path: 'Career',
};

function formatDuration(node: CareerNode) {
  if (!node.duration?.value) return null;
  return `${node.duration.value} ${node.duration.unit || 'months'}`;
}

interface CareerNodeCardProps {
  node: CareerNode;
  matchScore?: number;
  isSaved?: boolean;
  onSaveToggle?: (nodeId: string, saved: boolean) => void;
  compact?: boolean;
}

export function CareerNodeCard({ node, matchScore, isSaved = false, onSaveToggle, compact = false }: CareerNodeCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      await savePath(node._id, saved ? undefined : 'interested');
      setSaved(!saved);
      onSaveToggle?.(node._id, !saved);
    } catch {
      // Silently fail — save is not critical
    } finally {
      setSaving(false);
    }
  };

  const difficulty = node.difficultyLevel ? DIFFICULTY_COLOR[node.difficultyLevel] : null;
  const duration = formatDuration(node);
  const typeLabel = NODE_TYPE_LABEL[node.nodeType] || node.nodeType;

  if (compact) {
    return (
      <Link
        to={`/career-explorer/${node._id}`}
        className="flex items-center gap-4 p-4 rounded-xl bg-cream-100 border border-cream-200 hover:shadow-lift transition-all group"
      >
        {node.thumbnail?.url ? (
          <img src={node.thumbnail.url} alt={node.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-night-100/5 flex items-center justify-center flex-shrink-0 text-xs text-night-600/40 font-display">
            {node.title.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm text-night-800 truncate group-hover:text-night-900">{node.title}</p>
          <p className="text-xs text-night-600/50">{typeLabel}</p>
        </div>
        <svg className="w-4 h-4 text-night-600/30 group-hover:text-night-900/40 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      to={`/career-explorer/${node._id}`}
      className="group block bg-cream-100 rounded-2xl overflow-hidden border border-cream-200 hover:shadow-lift transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-night-100/5 overflow-hidden">
        {node.thumbnail?.url ? (
          <img
            src={node.thumbnail.url}
            alt={node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-night-100/5 to-night-100/10">
            <span className="font-display text-5xl text-night-800/10 group-hover:text-night-800/20 transition-colors">
              {node.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            saved
              ? 'bg-gold-500 text-night-900'
              : 'bg-night-900/40 text-cream-100/80 hover:bg-night-900/60'
          }`}
          title={saved ? 'Saved' : 'Save career'}
        >
          <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-night-900/70 backdrop-blur-sm text-cream-100/90">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-base text-night-800 leading-snug group-hover:text-night-900 mb-3 line-clamp-2">
          {node.title}
        </h3>

        {/* Match score */}
        {matchScore !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-night-600/60">Profile Match</span>
              <span className="text-xs font-mono text-night-700 font-medium">{matchScore}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-night-200/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${matchScore}%`,
                  background: matchScore >= 70 ? '#10B981' : matchScore >= 50 ? '#C9A96A' : '#EF4444',
                }}
              />
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-2">
          {difficulty && (
            <span className={`px-2 py-0.5 rounded text-xs border ${difficulty}`}>
              {node.difficultyLevel?.replace('_', ' ')}
            </span>
          )}
          {duration && (
            <span className="text-xs text-night-600/50">{duration}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
