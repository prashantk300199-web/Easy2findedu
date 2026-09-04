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
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleFacility(facility)}
          className="hidden"
        />
        {isSelected ? (
          <CheckSquare className="text-blue-600 mr-3 flex-shrink-0" size={20} />
        ) : (
          <Square className="text-gray-400 mr-3 flex-shrink-0" size={20} />
        )}
        <span className={`text-sm ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
          {facility}
        </span>
      </label>
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Facilities</h2>
      <p className="text-gray-600 mb-6">Select all facilities available at your institute (Optional)</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Facilities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {GENERAL_FACILITIES.map(renderFacilityCheckbox)}
          </div>
        </div>

        {/* Academic / Learning Facilities */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic / Learning Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACADEMIC_FACILITIES.map(renderFacilityCheckbox)}
          </div>
        </div>

        {/* Category-Specific Facilities */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category-Specific Facilities</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select facilities specific to your institute type (Dance, Music, Makeup, Coding, Trading, etc.)
          </p>

          {Object.entries(CATEGORY_SPECIFIC_FACILITIES).map(([category, facilities]) => (
            <div key={category} className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {facilities.map(renderFacilityCheckbox)}
              </div>
            </div>
          ))}
        </div>

        {/* Other Facilities */}
        <div className="border-t pt-8">
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all mb-4 ${
              showOther
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={showOther}
              onChange={toggleOther}
              className="hidden"
            />
            {showOther ? (
              <CheckSquare className="text-blue-600 mr-3 flex-shrink-0" size={20} />
            ) : (
              <Square className="text-gray-400 mr-3 flex-shrink-0" size={20} />
            )}
            <div>
              <span className={`text-sm font-medium ${showOther ? 'text-blue-900' : 'text-gray-700'}`}>
                Other Facilities
              </span>
              <p className="text-xs text-gray-500 mt-1">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Summary */}
        {selectedFacilities.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Selected Facilities ({selectedFacilities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedFacilities.map(facility => (
                <span
                  key={facility}
                  className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
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
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
