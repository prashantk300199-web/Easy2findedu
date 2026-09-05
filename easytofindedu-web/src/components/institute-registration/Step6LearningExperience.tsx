import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface LearningExperienceData {
  liveClasses?: boolean;
  recordedClasses?: boolean;
  practicalTraining?: boolean;
  liveProjects?: boolean;
  assignments?: boolean;
  tests?: boolean;
  mockTests?: boolean;
  doubtSessions?: boolean;
  personalMentorship?: boolean;
  oneToOneClasses?: boolean;
  studyMaterial?: boolean;
  workshops?: boolean;
  events?: boolean;
  competitions?: boolean;
  performanceOpportunities?: boolean;
  communityAccess?: boolean;
  learningPlatform?: boolean;
  mobileApp?: boolean;
  webPortal?: boolean;
  onlineTests?: boolean;
  whatsappSupport?: boolean;
  technicalSupport?: boolean;
}

interface Step6LearningExperienceProps {
  data?: LearningExperienceData;
  onChange: (data: LearningExperienceData) => void;
  onNext: (data: LearningExperienceData) => void;
  onBack: () => void;
  onSaveDraft: (data: LearningExperienceData) => void;
  loading?: boolean;
}

const Step6LearningExperience: React.FC<Step6LearningExperienceProps> = ({ data, onChange, onNext, onBack, onSaveDraft, loading }) => {
  const [features, setFeatures] = useState<LearningExperienceData>(data || {
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

  const handleToggle = (key: string) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key as keyof LearningExperienceData]
    }));
  };

  const handleNext = () => {
    onChange(features);
    onNext(features);
  };

  const handleSaveDraft = () => {
    onSaveDraft(features);
  };

  const getSelectedCount = () => {
    return Object.values(features).filter(Boolean).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-cream-100 mb-2">Learning Experience</h2>
        <p className="text-cream-100/60">
          Select the learning features and experiences you offer. This helps students understand what they'll get.
        </p>
        <p className="text-sm text-gold-500 mt-2">
          {getSelectedCount()} feature{getSelectedCount() !== 1 ? 's' : ''} selected
        </p>
      </div>

      <div className="space-y-6">
        {featureGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-night-900 border border-cream-100/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cream-100 mb-4">{group.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.features.map((feature) => (
                <label
                  key={feature.key}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    features[feature.key as keyof LearningExperienceData]
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-cream-100/10 hover:border-cream-100/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={features[feature.key as keyof LearningExperienceData] || false}
                    onChange={() => handleToggle(feature.key)}
                    className="hidden"
                  />
                  {features[feature.key as keyof LearningExperienceData] ? (
                    <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-cream-100/40 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    features[feature.key as keyof LearningExperienceData] ? 'text-cream-100' : 'text-cream-100/60'
                  }`}>
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-night-900/50 border border-gold-500/20 rounded-lg p-4">
        <p className="text-sm text-cream-100/80">
          <strong>Tip:</strong> Select all features that apply to your institute. These help students make informed decisions and improve your visibility in search results.
        </p>
      </div>

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
    </div>
  );
};

export default Step6LearningExperience;
