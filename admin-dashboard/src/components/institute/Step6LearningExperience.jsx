import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * Step 6: Learning Experience
 *
 * Allows institute owners to select learning features and experiences offered.
 */
const Step6LearningExperience = ({ data, onChange, onNext, onPrev }) => {
  const [features, setFeatures] = useState(data || {
    liveClasses: false,
    recordedClasses: false,
    practicalTraining: false,
    liveProjects: false,
    assignments: false,
    tests: false,
    mockTests: false,
    doubtSessions: false,
    personalMentorship: false,
    oneToOneClasses: false,
    studyMaterial: false,
    workshops: false,
    events: false,
    competitions: false,
    performanceOpportunities: false,
    communityAccess: false,
    learningPlatform: false,
    mobileApp: false,
    webPortal: false,
    onlineTests: false,
    whatsappSupport: false,
    technicalSupport: false
  });

  const featureGroups = [
    {
      title: 'Class Format',
      features: [
        { key: 'liveClasses', label: 'Live Classes' },
        { key: 'recordedClasses', label: 'Recorded Classes' },
        { key: 'oneToOneClasses', label: '1-to-1 Classes' },
        { key: 'practicalTraining', label: 'Practical Training' }
      ]
    },
    {
      title: 'Learning Materials',
      features: [
        { key: 'studyMaterial', label: 'Study Material' },
        { key: 'assignments', label: 'Assignments' },
        { key: 'liveProjects', label: 'Live Projects' }
      ]
    },
    {
      title: 'Assessment',
      features: [
        { key: 'tests', label: 'Tests' },
        { key: 'mockTests', label: 'Mock Tests' },
        { key: 'onlineTests', label: 'Online Tests' }
      ]
    },
    {
      title: 'Support & Mentorship',
      features: [
        { key: 'doubtSessions', label: 'Doubt Sessions' },
        { key: 'personalMentorship', label: 'Personal Mentorship' },
        { key: 'whatsappSupport', label: 'WhatsApp Support' },
        { key: 'technicalSupport', label: 'Technical Support' }
      ]
    },
    {
      title: 'Activities & Events',
      features: [
        { key: 'workshops', label: 'Workshops' },
        { key: 'events', label: 'Events' },
        { key: 'competitions', label: 'Competitions' },
        { key: 'performanceOpportunities', label: 'Performance Opportunities' }
      ]
    },
    {
      title: 'Platform & Access',
      features: [
        { key: 'learningPlatform', label: 'Learning Platform' },
        { key: 'mobileApp', label: 'Mobile App' },
        { key: 'webPortal', label: 'Web Portal' },
        { key: 'communityAccess', label: 'Community Access' }
      ]
    }
  ];

  const handleToggle = (key) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNext = () => {
    onChange(features);
    onNext();
  };

  const getSelectedCount = () => {
    return Object.values(features).filter(Boolean).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Experience</h2>
        <p className="text-gray-600">
          Select the learning features and experiences you offer. This helps students understand what they'll get.
        </p>
        <p className="text-sm text-blue-600 mt-2">
          {getSelectedCount()} feature{getSelectedCount() !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Feature Groups */}
      <div className="space-y-6">
        {featureGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.features.map((feature) => (
                <label
                  key={feature.key}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    features[feature.key]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={features[feature.key]}
                    onChange={() => handleToggle(feature.key)}
                    className="hidden"
                  />
                  {features[feature.key] ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    features[feature.key] ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Select all features that apply to your institute. These help students make informed decisions and improve your visibility in search results.
        </p>
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

export default Step6LearningExperience;
