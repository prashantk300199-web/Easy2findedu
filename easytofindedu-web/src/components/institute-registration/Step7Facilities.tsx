import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface Step5Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const GENERAL_FACILITIES = [
  'Wi-Fi',
  'Air Conditioning (AC)',
  'Non-AC',
  'Drinking Water',
  'Washrooms',
  'Waiting Area',
  'Parking',
  'CCTV',
  'Security',
  'Accessibility',
  'Power Backup',
  'Reception',
  'Cafeteria',
  'Transport'
];

const ACADEMIC_FACILITIES = [
  'Classrooms',
  'Computer Lab',
  'Laboratories',
  'Library',
  'Sports Facilities',
  'Medical Facility'
];

const CATEGORY_SPECIFIC_FACILITIES = {
  'Dance': [
    'Dance Studio',
    'Mirrors',
    'Sound System',
    'Changing Room'
  ],
  'Music': [
    'Recording Studio',
    'Practice Rooms',
    'Instruments Available',
    'Soundproof Room'
  ],
  'Makeup / Beauty': [
    'Makeup Stations',
    'Professional Kits',
    'Salon Setup',
    'Live Model Practice Area'
  ],
  'Coding / Technology': [
    'Computer Lab',
    'Individual Systems',
    'High-Speed Internet',
    'Project Lab'
  ],
  'Stock Market / Trading': [
    'Trading Lab',
    'Multiple Screens',
    'Market Terminal'
  ]
};

export default function Step5Facilities({ data, onNext, onBack, onSaveDraft, loading }: Step5Props) {
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(data?.facilities || []);
  const [showOther, setShowOther] = useState(data?.otherFacilities ? true : false);
  const [otherFacilities, setOtherFacilities] = useState(data?.otherFacilities || '');

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facility)) {
        return prev.filter(f => f !== facility);
      } else {
        return [...prev, facility];
      }
    });
  };

  const toggleOther = () => {
    setShowOther(prev => !prev);
    if (showOther) {
      setOtherFacilities('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      facilities: selectedFacilities,
      otherFacilities: showOther ? otherFacilities : ''
    });
  };

  const handleSave = () => {
    onSaveDraft({
      facilities: selectedFacilities,
      otherFacilities: showOther ? otherFacilities : ''
    });
  };

  const renderFacilityCheckbox = (facility: string) => {
    const isSelected = selectedFacilities.includes(facility);
    return (
      <label
        key={facility}
        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-gold-500 bg-gold-900/20 shadow-goldGlow'
            : 'border-night-700 bg-night-900 hover:border-gold-500/30'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleFacility(facility)}
          className="hidden"
        />
        {isSelected ? (
          <CheckSquare className="text-gold-400 mr-3 flex-shrink-0" size={20} />
        ) : (
          <Square className="text-cream-100/40 mr-3 flex-shrink-0" size={20} />
        )}
        <span className={`text-sm ${isSelected ? 'font-semibold text-gold-400' : 'text-cream-100'}`}>
          {facility}
        </span>
      </label>
    );
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Facilities</h2>
      <p className="text-cream-100/60 mb-8">Select all facilities available at your institute (Optional)</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Facilities */}
        <div>
          <h3 className="text-xl font-semibold text-cream-100 mb-4">General Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {GENERAL_FACILITIES.map(renderFacilityCheckbox)}
          </div>
        </div>

        {/* Academic / Learning Facilities */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-4">Academic / Learning Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACADEMIC_FACILITIES.map(renderFacilityCheckbox)}
          </div>
        </div>

        {/* Category-Specific Facilities */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-4">Category-Specific Facilities</h3>
          <p className="text-sm text-cream-100/50 mb-4">
            Select facilities specific to your institute type (Dance, Music, Makeup, Coding, Trading, etc.)
          </p>

          {Object.entries(CATEGORY_SPECIFIC_FACILITIES).map(([category, facilities]) => (
            <div key={category} className="mb-6">
              <h4 className="text-md font-medium text-gold-400 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {facilities.map(renderFacilityCheckbox)}
              </div>
            </div>
          ))}
        </div>

        {/* Other Facilities */}
        <div className="border-t border-night-700 pt-8">
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all mb-4 ${
              showOther
                ? 'border-gold-500 bg-gold-900/20'
                : 'border-night-700 bg-night-900 hover:border-gold-500/30'
            }`}
          >
            <input
              type="checkbox"
              checked={showOther}
              onChange={toggleOther}
              className="hidden"
            />
            {showOther ? (
              <CheckSquare className="text-gold-400 mr-3 flex-shrink-0" size={20} />
            ) : (
              <Square className="text-cream-100/40 mr-3 flex-shrink-0" size={20} />
            )}
            <div>
              <span className={`text-sm font-medium ${showOther ? 'text-gold-400' : 'text-cream-100'}`}>
                Other Facilities
              </span>
              <p className="text-xs text-cream-100/50 mt-1">
                Specify any additional facilities not listed above
              </p>
            </div>
          </label>

          {showOther && (
            <textarea
              value={otherFacilities}
              onChange={(e) => setOtherFacilities(e.target.value)}
              rows={4}
              placeholder="List any other facilities available at your institute..."
              className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
            />
          )}
        </div>

        {/* Summary */}
        {selectedFacilities.length > 0 && (
          <div className="bg-night-900/50 border border-gold-500/30 rounded-lg p-5">
            <h4 className="font-semibold text-gold-400 mb-3">
              Selected Facilities ({selectedFacilities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedFacilities.map(facility => (
                <span
                  key={facility}
                  className="bg-night-900 text-gold-400 px-3 py-1.5 rounded-full text-sm border border-gold-500/30"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 disabled:opacity-50 transition-all font-bold shadow-goldGlow"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
