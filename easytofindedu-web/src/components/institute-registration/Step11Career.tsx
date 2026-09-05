import React, { useState } from 'react';
import { CheckCircle2, Circle, Info } from 'lucide-react';

interface CareerData {
  placementAssistance?: boolean;
  jobAssistance?: boolean;
  internshipAssistance?: boolean;
  freelancingSupport?: boolean;
  businessSupport?: boolean;
  careerCounselling?: boolean;
  industryConnections?: boolean;
  portfolioDevelopment?: boolean;
  certification?: boolean;
  performanceOpportunities?: boolean;
  competitionOpportunities?: boolean;
  furtherEducationGuidance?: boolean;
  topRecruiters?: string;
  industryPartners?: string;
  averagePackage?: string;
  highestPackage?: string;
  placementRate?: string;
  careerOutcomes?: string;
}

interface Step11CareerProps {
  data?: CareerData;
  onChange: (data: CareerData) => void;
  onNext: (data: CareerData) => void;
  onBack: () => void;
  onSaveDraft: (data: CareerData) => void;
  loading?: boolean;
}

const Step11Career: React.FC<Step11CareerProps> = ({ data, onChange, onNext, onBack, onSaveDraft, loading }) => {
  const [careerData, setCareerData] = useState<CareerData>(data || {
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

  const handleToggle = (key: string) => {
    const updated = {
      ...careerData,
      [key]: !careerData[key as keyof CareerData]
    };
    setCareerData(updated);
    onChange(updated);
  };

  const handleInputChange = (field: string, value: string) => {
    const updated = {
      ...careerData,
      [field]: value
    };
    setCareerData(updated);
    onChange(updated);
  };

  const handleNext = () => {
    onNext(careerData);
  };

  const handleSaveDraft = () => {
    onSaveDraft(careerData);
  };

  const getSelectedCount = () => {
    return careerServices.filter(service => careerData[service.key as keyof CareerData]).length;
  };

  const hasPlacementData = careerData.placementAssistance || careerData.jobAssistance;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-cream-100 mb-2">Career & Outcomes</h2>
        <p className="text-cream-100/60">
          Showcase career support services and outcomes. This section is optional but recommended for professional courses.
        </p>
      </div>

      <div className="bg-night-900/50 border border-gold-500/20 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-cream-100 font-medium">Optional Section</p>
          <p className="text-sm text-cream-100/60 mt-1">
            Skip this step if you don't offer career services (e.g., hobby classes, personal development courses).
            This is most relevant for professional training, coding bootcamps, vocational courses, etc.
          </p>
        </div>
      </div>

      <div className="bg-night-900 border border-cream-100/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cream-100 mb-4">
          Career Services
          {getSelectedCount() > 0 && (
            <span className="ml-2 text-sm font-normal text-gold-500">
              ({getSelectedCount()} selected)
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careerServices.map((service) => (
            <label
              key={service.key}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                careerData[service.key as keyof CareerData]
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-cream-100/10 hover:border-cream-100/20'
              }`}
            >
              <input
                type="checkbox"
                checked={careerData[service.key as keyof CareerData] as boolean || false}
                onChange={() => handleToggle(service.key)}
                className="hidden"
              />
              {careerData[service.key as keyof CareerData] ? (
                <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-cream-100/40 flex-shrink-0" />
              )}
              <span className={`text-sm font-medium ${
                careerData[service.key as keyof CareerData] ? 'text-cream-100' : 'text-cream-100/60'
              }`}>
                {service.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasPlacementData && (
        <div className="bg-night-900 border border-cream-100/10 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-cream-100">Placement Statistics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Top Recruiters
              </label>
              <textarea
                value={careerData.topRecruiters}
                onChange={(e) => handleInputChange('topRecruiters', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="e.g., Google, Microsoft, Amazon, TCS, Infosys..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Industry Partners
              </label>
              <textarea
                value={careerData.industryPartners}
                onChange={(e) => handleInputChange('industryPartners', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="e.g., IBM, Cognizant, Wipro..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Average Package
              </label>
              <input
                type="text"
                value={careerData.averagePackage}
                onChange={(e) => handleInputChange('averagePackage', e.target.value)}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="e.g., 5-6 LPA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Highest Package
              </label>
              <input
                type="text"
                value={careerData.highestPackage}
                onChange={(e) => handleInputChange('highestPackage', e.target.value)}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="e.g., 25 LPA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Placement Rate (%)
              </label>
              <input
                type="number"
                value={careerData.placementRate}
                onChange={(e) => handleInputChange('placementRate', e.target.value)}
                className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="e.g., 85"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-night-900 border border-cream-100/10 rounded-lg p-6">
        <label className="block text-sm font-medium text-cream-100 mb-2">
          Career Outcomes & Success Stories
        </label>
        <textarea
          value={careerData.careerOutcomes}
          onChange={(e) => handleInputChange('careerOutcomes', e.target.value)}
          rows={5}
          className="w-full px-4 py-2 bg-night-800 border border-cream-100/10 rounded-lg text-cream-100 placeholder-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          placeholder="Describe career outcomes, success stories, and achievements of your students/alumni..."
        />
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

export default Step11Career;
