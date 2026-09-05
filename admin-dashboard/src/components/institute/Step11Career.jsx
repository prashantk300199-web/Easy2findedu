import React, { useState } from 'react';
import { CheckCircle2, Circle, Info } from 'lucide-react';

/**
 * Step 11: Career & Outcomes
 *
 * Optional step for institutes that provide career support.
 * Allows institutes to showcase placement, job assistance, and career services.
 */
const Step11Career = ({ data, onChange, onNext, onPrev }) => {
  const [careerData, setCareerData] = useState(data || {
    placementAssistance: false,
    jobAssistance: false,
    internshipAssistance: false,
    freelancingSupport: false,
    businessSupport: false,
    careerCounselling: false,
    industryConnections: false,
    portfolioDevelopment: false,
    certification: false,
    performanceOpportunities: false,
    competitionOpportunities: false,
    furtherEducationGuidance: false,
    topRecruiters: '',
    industryPartners: '',
    averagePackage: '',
    highestPackage: '',
    placementRate: '',
    careerOutcomes: ''
  });

  const careerServices = [
    { key: 'placementAssistance', label: 'Placement Assistance' },
    { key: 'jobAssistance', label: 'Job Assistance' },
    { key: 'internshipAssistance', label: 'Internship Assistance' },
    { key: 'freelancingSupport', label: 'Freelancing Support' },
    { key: 'businessSupport', label: 'Business/Startup Support' },
    { key: 'careerCounselling', label: 'Career Counselling' },
    { key: 'industryConnections', label: 'Industry Connections' },
    { key: 'portfolioDevelopment', label: 'Portfolio Development' },
    { key: 'certification', label: 'Certification' },
    { key: 'performanceOpportunities', label: 'Performance Opportunities' },
    { key: 'competitionOpportunities', label: 'Competition Opportunities' },
    { key: 'furtherEducationGuidance', label: 'Further Education Guidance' }
  ];

  const handleToggle = (key) => {
    setCareerData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (field, value) => {
    setCareerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onChange(careerData);
    onNext();
  };

  const getSelectedCount = () => {
    return careerServices.filter(service => careerData[service.key]).length;
  };

  const hasPlacementData = careerData.placementAssistance || careerData.jobAssistance;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Career & Outcomes</h2>
        <p className="text-gray-600">
          Showcase career support services and outcomes. This section is optional but recommended for professional courses.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Optional Section</p>
          <p className="text-sm text-blue-600 mt-1">
            Skip this step if you don't offer career services (e.g., hobby classes, personal development courses).
            This is most relevant for professional training, coding bootcamps, vocational courses, etc.
          </p>
        </div>
      </div>

      {/* Career Services */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Career Services
          {getSelectedCount() > 0 && (
            <span className="ml-2 text-sm font-normal text-blue-600">
              ({getSelectedCount()} selected)
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careerServices.map((service) => (
            <label
              key={service.key}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                careerData[service.key]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={careerData[service.key]}
                onChange={() => handleToggle(service.key)}
                className="hidden"
              />
              {careerData[service.key] ? (
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
              )}
              <span className={`text-sm font-medium ${
                careerData[service.key] ? 'text-blue-900' : 'text-gray-700'
              }`}>
                {service.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Placement Statistics (only if placement services are selected) */}
      {hasPlacementData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Placement Statistics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Recruiters */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top Recruiters
              </label>
              <textarea
                value={careerData.topRecruiters}
                onChange={(e) => handleInputChange('topRecruiters', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Google, Microsoft, Amazon, TCS, Infosys..."
              />
            </div>

            {/* Industry Partners */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Partners
              </label>
              <textarea
                value={careerData.industryPartners}
                onChange={(e) => handleInputChange('industryPartners', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., IBM, Cognizant, Wipro..."
              />
            </div>

            {/* Average Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Package
              </label>
              <input
                type="text"
                value={careerData.averagePackage}
                onChange={(e) => handleInputChange('averagePackage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 5-6 LPA"
              />
            </div>

            {/* Highest Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highest Package
              </label>
              <input
                type="text"
                value={careerData.highestPackage}
                onChange={(e) => handleInputChange('highestPackage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25 LPA"
              />
            </div>

            {/* Placement Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placement Rate (%)
              </label>
              <input
                type="number"
                value={careerData.placementRate}
                onChange={(e) => handleInputChange('placementRate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 85"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Career Outcomes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Outcomes & Success Stories
        </label>
        <textarea
          value={careerData.careerOutcomes}
          onChange={(e) => handleInputChange('careerOutcomes', e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe career outcomes, success stories, and achievements of your students/alumni..."
        />
      </div>

      {/* Navigation Buttons */}
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
    </div>
  );
};

export default Step11Career;
