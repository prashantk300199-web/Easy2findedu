import { useState } from 'react';
import { DollarSign, Award, CreditCard, FileText, Info } from 'lucide-react';

interface Step7Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step7FeesScholarships({ data, onNext, onBack, onSaveDraft, loading }: Step7Props) {
  // Per-course fee structure (registration / admission / course /
  // monthly / quarterly / material / kit / exam / certification /
  // other / total / GST) now lives on each course in Step 4. This
  // step only carries institute-level policy fields that apply across
  // all courses — scholarships, EMI, refund, and cancellation.
  // We still read legacy `feeIncludesGst` at the institute level for
  // backward compatibility, but it is no longer edited here.
  const [formData, setFormData] = useState({
    scholarshipAvailable: data?.scholarshipAvailable || false,
    scholarshipDetails: data?.scholarshipDetails || '',
    installmentAvailable: data?.installmentAvailable || false,
    installmentSchedule: data?.installmentSchedule || '',
    emiProvider: data?.emiProvider || '',
    refundPolicy: data?.refundPolicy || '',
    cancellationPolicy: data?.cancellationPolicy || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleSave = () => {
    onSaveDraft(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Fees & Scholarships</h2>
      <p className="text-cream-100/60 mb-8">Provide fee structure and scholarship information (All fields optional)</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Note: per-course fees (registration, admission, course,
            monthly, quarterly, material, kit, exam, certification,
            other, total) plus the GST inclusion flag now live on each
            course in Step 4. The fields below apply across all
            courses at the institute. */}
        <div className="p-5 rounded-lg border border-gold-500/30 bg-night-900/60 flex items-start gap-3">
          <Info size={18} className="text-gold-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cream-100">
              Per-course fees and GST are set on each course.
            </p>
            <p className="text-xs text-cream-100/50 mt-1">
              Open Step 4 (Courses / Programs) and edit a course to set
              its fee structure and whether the listed amount includes
              GST. The fields below are institute-wide policies.
            </p>
          </div>
        </div>

        {/* Scholarship */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <Award size={20} className="text-gold-400" />
            Scholarship
          </h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="scholarshipAvailable"
                checked={formData.scholarshipAvailable}
                onChange={handleChange}
                className="mr-3 h-4 w-4 accent-gold-500"
              />
              <span className="text-sm text-cream-100">Scholarship Available</span>
            </label>

            {formData.scholarshipAvailable && (
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  Scholarship Details
                </label>
                <textarea
                  name="scholarshipDetails"
                  value={formData.scholarshipDetails}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe scholarship criteria, benefits, and application process..."
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Options */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-gold-400" />
            Payment Options
          </h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="installmentAvailable"
                checked={formData.installmentAvailable}
                onChange={handleChange}
                className="mr-3 h-4 w-4 accent-gold-500"
              />
              <span className="text-sm text-cream-100">Installment / EMI Available</span>
            </label>

            {formData.installmentAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    Installment Schedule
                  </label>
                  <input
                    type="text"
                    name="installmentSchedule"
                    value={formData.installmentSchedule}
                    onChange={handleChange}
                    placeholder="E.g., 3 months, 6 months, 12 months"
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    EMI Provider
                  </label>
                  <input
                    type="text"
                    name="emiProvider"
                    value={formData.emiProvider}
                    onChange={handleChange}
                    placeholder="E.g., Bajaj Finserv, HDFC, etc."
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policies */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-gold-400" />
            Policies
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Refund Policy
              </label>
              <textarea
                name="refundPolicy"
                value={formData.refundPolicy}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your refund policy..."
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Cancellation Policy
              </label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your cancellation policy..."
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>
          </div>
        </div>

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
