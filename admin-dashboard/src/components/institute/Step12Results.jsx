import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, AlertCircle } from 'lucide-react';

/**
 * Step 12: Results & Achievements
 *
 * Allows institutes to showcase academic results and achievements.
 * Supports both academic exam results and non-academic achievements.
 */
const Step12Results = ({ data, onChange, onNext, onPrev }) => {
  const [results, setResults] = useState(data?.results || []);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    exam: '',
    year: '',
    studentsAppeared: '',
    qualified: '',
    selected: '',
    highestRank: '',
    topScores: '',
    selectionPercentage: '',
    airStateRank: '',
    supportingDocFile: '',
    supportingDocPreview: ''
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
      airStateRank: '',
      supportingDocFile: '',
      supportingDocPreview: ''
    });
    setEditingIndex(null);
    setShowForm(true);
    setError('');
  };

  const handleEditResult = (index) => {
    setFormData(results[index]);
    setEditingIndex(index);
    setShowForm(true);
    setError('');
  };

  const handleDeleteResult = (index) => {
    const newResults = results.filter((_, i) => i !== index);
    setResults(newResults);
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

    let newResults;
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
  };

  const handleCancel = () => {
    setShowForm(false);
    setError('');
  };

  const handleNext = () => {
    onChange({
      results,
      ...otherData
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Results & Achievements</h2>
        <p className="text-gray-600">
          Showcase your institute's academic results, awards, and student achievements.
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Optional Section</p>
          <p className="text-sm text-blue-600 mt-1">
            This section is optional. Add exam results for academic institutes or achievements for non-academic institutes.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Academic Results Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Academic Results</h3>

        {/* Result List */}
        {!showForm && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{result.exam}</h4>
                    <p className="text-sm text-gray-600 mt-1">Year: {result.year}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {result.studentsAppeared && (
                        <div>
                          <p className="text-xs text-gray-500">Appeared</p>
                          <p className="text-sm font-medium text-gray-900">{result.studentsAppeared}</p>
                        </div>
                      )}
                      {result.qualified && (
                        <div>
                          <p className="text-xs text-gray-500">Qualified</p>
                          <p className="text-sm font-medium text-gray-900">{result.qualified}</p>
                        </div>
                      )}
                      {result.selected && (
                        <div>
                          <p className="text-xs text-gray-500">Selected</p>
                          <p className="text-sm font-medium text-gray-900">{result.selected}</p>
                        </div>
                      )}
                      {result.selectionPercentage && (
                        <div>
                          <p className="text-xs text-gray-500">Selection Rate</p>
                          <p className="text-sm font-medium text-gray-900">{result.selectionPercentage}%</p>
                        </div>
                      )}
                      {result.highestRank && (
                        <div>
                          <p className="text-xs text-gray-500">Highest Rank</p>
                          <p className="text-sm font-medium text-gray-900">{result.highestRank}</p>
                        </div>
                      )}
                      {result.topScores && (
                        <div>
                          <p className="text-xs text-gray-500">Top Scores</p>
                          <p className="text-sm font-medium text-gray-900">{result.topScores}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditResult(index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResult(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Result Button */}
        {!showForm && (
          <button
            type="button"
            onClick={handleAddResult}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Academic Result</span>
          </button>
        )}

        {/* Result Form */}
        {showForm && (
          <div className="bg-white border-2 border-blue-500 rounded-lg p-6 space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">
              {editingIndex !== null ? 'Edit Result' : 'Add New Result'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., NEET, JEE, CA Foundation"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2024, 2023-24"
                />
              </div>

              {/* Students Appeared */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Students Appeared
                </label>
                <input
                  type="number"
                  value={formData.studentsAppeared}
                  onChange={(e) => setFormData({ ...formData, studentsAppeared: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Qualified */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualified
                </label>
                <input
                  type="number"
                  value={formData.qualified}
                  onChange={(e) => setFormData({ ...formData, qualified: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Selected */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected
                </label>
                <input
                  type="number"
                  value={formData.selected}
                  onChange={(e) => setFormData({ ...formData, selected: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Selection Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selection Percentage
                </label>
                <input
                  type="number"
                  value={formData.selectionPercentage}
                  onChange={(e) => setFormData({ ...formData, selectionPercentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              {/* Highest Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Rank
                </label>
                <input
                  type="text"
                  value={formData.highestRank}
                  onChange={(e) => setFormData({ ...formData, highestRank: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., AIR 10"
                />
              </div>

              {/* Top Scores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top Scores
                </label>
                <input
                  type="text"
                  value={formData.topScores}
                  onChange={(e) => setFormData({ ...formData, topScores: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 680/720, 99.9 percentile"
                />
              </div>

              {/* AIR/State Rank */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AIR/State Rank Details
                </label>
                <input
                  type="text"
                  value={formData.airStateRank}
                  onChange={(e) => setFormData({ ...formData, airStateRank: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5 students in top 100 AIR"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingIndex !== null ? 'Update Result' : 'Add Result'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Other Achievements Section */}
      {!showForm && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Other Achievements</h3>

          <div className="grid grid-cols-1 gap-6">
            {/* Awards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Awards & Recognition
              </label>
              <textarea
                value={otherData.awards}
                onChange={(e) => setOtherData({ ...otherData, awards: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Awards received by the institute or faculty..."
              />
            </div>

            {/* Competition Wins */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition Wins
              </label>
              <textarea
                value={otherData.competitionWins}
                onChange={(e) => setOtherData({ ...otherData, competitionWins: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Student achievements in competitions..."
              />
            </div>

            {/* Student Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Achievements
              </label>
              <textarea
                value={otherData.studentAchievements}
                onChange={(e) => setOtherData({ ...otherData, studentAchievements: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notable achievements by students..."
              />
            </div>

            {/* Success Stories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Stories
              </label>
              <textarea
                value={otherData.successStories}
                onChange={(e) => setOtherData({ ...otherData, successStories: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share inspiring success stories of your students/alumni..."
              />
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications Awarded
              </label>
              <textarea
                value={otherData.certifications}
                onChange={(e) => setOtherData({ ...otherData, certifications: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Details about certifications provided to students..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {!showForm && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save & Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Step12Results;
