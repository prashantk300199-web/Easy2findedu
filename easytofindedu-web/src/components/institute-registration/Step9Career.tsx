import { useState } from 'react';
import { Briefcase, TrendingUp, Award, Users } from 'lucide-react';

interface Step9Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const CAREER_SERVICES = [
  'Placement Assistance',
  'Job Assistance',
  'Internship Assistance',
  'Freelancing Support',
  'Business / Startup Support',
  'Career Counselling',
  'Industry Connections',
  'Portfolio Development',
  'Certification',
  'Performance Opportunities',
  'Competition Opportunities',
  'Further Education Guidance'
];

export default function Step9Career({ data, onNext, onBack, onSaveDraft, loading }: Step9Props) {
  const [formData, setFormData] = useState({
    careerServices: data?.careerServices || [],
    topRecruiters: data?.topRecruiters || '',
    industryPartners: data?.industryPartners || '',
    averagePackage: data?.averagePackage || '',
    highestPackage: data?.highestPackage || '',
    placementRate: data?.placementRate || '',
    careerOutcomes: data?.careerOutcomes || ''
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const services = prev.careerServices as string[];
      if (services.includes(service)) {
        return { ...prev, careerServices: services.filter(s => s !== service) };
      } else {
        return { ...prev, careerServices: [...services, service] };
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleSave = () => {
    onSaveDraft(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Career / Outcomes</h2>
      <p className="text-gray-600 mb-6">Provide career support and outcome information (All fields optional)</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Career Services */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={20} />
            Career Services & Support
          </h3>
          <p className="text-sm text-gray-500 mb-4">Select all services you provide to students</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAREER_SERVICES.map(service => (
              <label
                key={service}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  (formData.careerServices as string[]).includes(service)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={(formData.careerServices as string[]).includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>

          {(formData.careerServices as string[]).length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Selected Services ({(formData.careerServices as string[]).length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {(formData.careerServices as string[]).map(service => (
                  <span
                    key={service}
                    className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Placement & Industry Information */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            Placement & Industry Information
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            For professional/vocational institutes (Skip if not applicable)
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top Recruiters
              </label>
              <textarea
                name="topRecruiters"
                value={formData.topRecruiters}
                onChange={handleChange}
                rows={3}
                placeholder="List top companies that recruit from your institute (comma separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Partners
              </label>
              <textarea
                name="industryPartners"
                value={formData.industryPartners}
                onChange={handleChange}
                rows={3}
                placeholder="List industry partners, collaborations, and tie-ups"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Package (₹ LPA)
                </label>
                <input
                  type="text"
                  name="averagePackage"
                  value={formData.averagePackage}
                  onChange={handleChange}
                  placeholder="E.g., 6 LPA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Package (₹ LPA)
                </label>
                <input
                  type="text"
                  name="highestPackage"
                  value={formData.highestPackage}
                  onChange={handleChange}
                  placeholder="E.g., 15 LPA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placement Rate (%)
                </label>
                <input
                  type="number"
                  name="placementRate"
                  value={formData.placementRate}
                  onChange={handleChange}
                  placeholder="E.g., 85"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Career Outcomes */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Career Outcomes & Success Stories
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Outcomes
            </label>
            <textarea
              name="careerOutcomes"
              value={formData.careerOutcomes}
              onChange={handleChange}
              rows={5}
              placeholder="Describe typical career paths, success stories, notable alumni, achievements, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: "Our students work at Google, Amazon, Microsoft" or "Alumni perform at national dance festivals" or "Graduates run successful makeup studios"
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <Award size={18} />
            Note for Non-Professional Institutes
          </h4>
          <p className="text-sm text-yellow-800">
            If your institute focuses on arts, hobbies, personal development, or creative skills (dance, music, makeup, photography, etc.),
            you can skip placement-related fields and focus on career services like performance opportunities, portfolio development,
            competition participation, or freelancing support.
          </p>
        </div>

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
