import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, AlertCircle } from 'lucide-react';

interface Result {
  id: string;
  exam: string;
  year: string;
  studentsAppeared: string;
  qualified: string;
  selected: string;
  highestRank: string;
  topScores: string;
  selectionPercentage: string;
  airStateRank: string;
  supportingDocFile?: string;
  supportingDocPreview?: string;
}

interface ResultsData {
  results?: Result[];
  awards?: string;
  competitionWins?: string;
  studentAchievements?: string;
  successStories?: string;
  certifications?: string;
  careerOutcomes?: string;
}

interface Step12ResultsProps {
  data?: ResultsData;
  onChange: (data: ResultsData) => void;
  onNext: (data: ResultsData) => void;
  onBack: () => void;
  onSaveDraft: (data: ResultsData) => void;
  loading?: boolean;
}

const Step12Results: React.FC<Step12ResultsProps> = ({ data, onChange, onNext, onBack, onSaveDraft, loading }) => {
  const [results, setResults] = useState<Result[]>(data?.results || []);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Result>({
    id: '',
    exam: '',
    year: '',
    studentsAppeared: '',
    qualified: '',
    selected: '',
    highestRank: '',
    topScores: '',
    selectionPercentage: '',
    airStateRank: ''
  });

  const [otherData, setOtherData] = useState({
    awards: data?.awards || '',
    competitionWins: data?.competitionWins || '',
    studentAchievements: data?.studentAchievements || '',
    successStories: data?.successStories || '',
    certifications: data?.certifications || '',
    careerOutcomes: data?.careerOutcomes || ''
  });

  const handleAddResult = () => {
    setFormData({
      id: Date.now().toString(),
      exam: '',
      year: '',
      studentsAppeared: '',
      qualified: '',
      selected: '',
      highestRank: '',
      topScores: '',
      selectionPercentage: '',
      airStateRank: ''
    });
    setEditingIndex(null);
    setShowForm(true);
    setError('');
  };

  const handleEditResult = (index: number) => {
    setFormData(results[index]);
    setEditingIndex(index);
    setShowForm(true);
    setError('');
  };

  const handleDeleteResult = (index: number) => {
    const newResults = results.filter((_, i) => i !== index);
    setResults(newResults);
    notifyChange(newResults);
  };

  const validateForm = () => {
    if (!formData.exam.trim()) {
      setError('Exam name is required');
      return false;
    }
    if (!formData.year.trim()) {
      setError('Year is required');
      return false;
    }
    return true;
  };

  const handleSaveResult = () => {
    if (!validateForm()) {
      return;
    }

    let newResults: Result[];
    if (editingIndex !== null) {
      newResults = results.map((result, i) =>
        i === editingIndex ? formData : result
      );
    } else {
      newResults = [...results, formData];
    }

    setResults(newResults);
    setShowForm(false);
    setError('');
    notifyChange(newResults);
  };

  const handleCancel = () => {
    setShowForm(false);
    setError('');
  };

  const notifyChange = (updatedResults?: Result[]) => {
    const combined = {
      results: updatedResults !== undefined ? updatedResults : results,
      ...otherData
    };
    onChange(combined);
  };

  const handleOtherDataChange = (field: string, value: string) => {
    const updated = {
      ...otherData,
      [field]: value
    };
    setOtherData(updated);
    onChange({
      results,
      ...updated
    });
  };

  const handleNext = () => {
    onNext({
      results,
      ...otherData
    });
  };

  const handleSaveDraft = () => {
    onSaveDraft({
      results,
      ...otherData
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-cream-100 mb-2">Results & Achievements</h2>
        <p className="text-cream-100/60">
          Showcase your institute's academic results, awards, and student achievements.
        </p>
      </div>

      <div className="bg-night-900/50 border border-gold-500/20 rounded-lg p-4 flex items-start space-x-3">
        <Award className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-cream-100 font-medium">Optional Section</p>
          <p className="text-sm text-cream-100/60 mt-1">
            This section is optional. Add exam results for academic institutes or achievements for non-academic institutes.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-cream-100">Academic Results</h3>

        {!showForm && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result.id} className="bg-night-900 border border-cream-100/10 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-cream-100">{result.exam}</h4>
                    <p className="text-sm text-cream-100/60 mt-1">Year: {result.year}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {result.studentsAppeared && (
                        <div>
                          <p className="text-xs text-cream-100/60">Appeared</p>
                          <p className="text-sm font-medium text-cream-100">{result.studentsAppeared}</p>
                        </div>
                      )}
                      {result.qualified && (
                        <div>
                          <p className="text-xs text-cream-100/60">Qualified</p>
                          <p className="text-sm font-medium text-cream-100">{result.qualified}</p>
                        </div>
                      )}
                      {result.selected && (
                        <div>
                          <p className="text-xs text-cream-100/60">Selected</p>
                          <p className="text-sm font-medium text-cream-100">{result.selected}</p>
                        </div>
                      )}
                      {result.selectionPercentage && (
                        <div>
                          <p className="text-xs text-cream-100/60">Selection Rate</p>
                          <p className="text-sm font-medium text-cream-100">{result.selectionPercentage}%</p>
                        </div>
                      )}
                      {result.highestRank && (
                        <div>
                          <p className="text-xs text-cream-100/60">Highest Rank</p>
                          <p className="text-sm font-medium text-cream-100">{result.highestRank}</p>
                        </div>
                      )}
                      {result.topScores && (
                        <div>
                          <p className="text-xs text-cream-100/60">Top Scores</p>
                          <p className="text-sm font-medium text-cream-100">{result.topScores}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditResult(index)}
                      className="p-2 text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResult(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showForm && (
          <button
            type="button"
            onClick={handleAddResult}
            className="w-full py-4 border-2 border-dashed border-cream-100/20 rounded-lg text-cream-100/60 hover:border-gold-500 hover:text-gold-500 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Academic Result</span>
          </button>
        )}

        {showForm && (
          <div className="bg-night-900 border-2 border-gold-500 rounded-lg p-6 space-y-6">
            <h4 className="text-lg font-semibold text-cream-100">
              {editingIndex !== null ? 'Edit Result' : 'Add New Result'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Exam Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., NEET, JEE, CA Foundation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., 2024, 2023-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Students Appeared
                </label>
                <input
                  type="number"
                  value={formData.studentsAppeared}
                  onChange={(e) => setFormData({ ...formData, studentsAppeared: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Qualified
                </label>
                <input
                  type="number"
                  value={formData.qualified}
                  onChange={(e) => setFormData({ ...formData, qualified: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Selected
                </label>
                <input
                  type="number"
                  value={formData.selected}
                  onChange={(e) => setFormData({ ...formData, selected: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Selection Percentage
                </label>
                <input
                  type="number"
                  value={formData.selectionPercentage}
                  onChange={(e) => setFormData({ ...formData, selectionPercentage: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Highest Rank
                </label>
                <input
                  type="text"
                  value={formData.highestRank}
                  onChange={(e) => setFormData({ ...formData, highestRank: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., AIR 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  Top Scores
                </label>
                <input
                  type="text"
                  value={formData.topScores}
                  onChange={(e) => setFormData({ ...formData, topScores: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., 680/720, 99.9 percentile"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  AIR/State Rank Details
                </label>
                <input
                  type="text"
                  value={formData.airStateRank}
                  onChange={(e) => setFormData({ ...formData, airStateRank: e.target.value })}
                  className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., 5 students in top 100 AIR"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-cream-100/10">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-cream-100/20 rounded-lg text-cream-100 font-medium hover:bg-cream-100/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                className="px-6 py-2 bg-gold-600 text-night-950 rounded-lg font-medium hover:bg-gold-500 transition-colors"
              >
                {editingIndex !== null ? 'Update Result' : 'Add Result'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!showForm && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-cream-100">Other Achievements</h3>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Awards & Recognition
              </label>
              <textarea
                value={otherData.awards}
                onChange={(e) => handleOtherDataChange('awards', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Awards received by the institute or faculty..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Competition Wins
              </label>
              <textarea
                value={otherData.competitionWins}
                onChange={(e) => handleOtherDataChange('competitionWins', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Student achievements in competitions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Student Achievements
              </label>
              <textarea
                value={otherData.studentAchievements}
                onChange={(e) => handleOtherDataChange('studentAchievements', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Notable achievements by students..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Success Stories
              </label>
              <textarea
                value={otherData.successStories}
                onChange={(e) => handleOtherDataChange('successStories', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Share inspiring success stories of your students/alumni..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Certifications Awarded
              </label>
              <textarea
                value={otherData.certifications}
                onChange={(e) => handleOtherDataChange('certifications', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Details about certifications provided to students..."
              />
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="flex items-center justify-between pt-6 border-t border-cream-100/10">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 border border-cream-100/20 rounded-lg text-cream-100 font-medium hover:bg-cream-100/5 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-3 border border-gold-500/50 rounded-lg text-gold-500 font-medium hover:bg-gold-500/10 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-gold-600 text-night-950 rounded-lg font-medium hover:bg-gold-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step12Results;
