import { useState } from 'react';
import { DollarSign, Award, CreditCard, FileText } from 'lucide-react';

interface Step7Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step7FeesScholarships({ data, onNext, onBack, onSaveDraft, loading }: Step7Props) {
  const [formData, setFormData] = useState({
    registrationFee: data?.registrationFee || '',
    admissionFee: data?.admissionFee || '',
    courseFee: data?.courseFee || '',
    monthlyFee: data?.monthlyFee || '',
    quarterlyFee: data?.quarterlyFee || '',
    materialFee: data?.materialFee || '',
    kitFee: data?.kitFee || '',
    examFee: data?.examFee || '',
    certificationFee: data?.certificationFee || '',
    otherCharges: data?.otherCharges || '',
    totalPayableAmount: data?.totalPayableAmount || '',
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
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Fees & Scholarships</h2>
      <p className="text-gray-600 mb-6">Provide fee structure and scholarship information (All fields optional)</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Fee Structure */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Fee Structure
          </h3>
          <p className="text-sm text-gray-500 mb-4">Fill only the fee types that apply to your institute</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Fee (₹)
              </label>
              <input
                type="number"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Fee (₹)
              </label>
              <input
                type="number"
                name="admissionFee"
                value={formData.admissionFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Fee (₹)
              </label>
              <input
                type="number"
                name="courseFee"
                value={formData.courseFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Fee (₹)
              </label>
              <input
                type="number"
                name="monthlyFee"
                value={formData.monthlyFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quarterly Fee (₹)
              </label>
              <input
                type="number"
                name="quarterlyFee"
                value={formData.quarterlyFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Fee (₹)
              </label>
              <input
                type="number"
                name="materialFee"
                value={formData.materialFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kit Fee (₹)
              </label>
              <input
                type="number"
                name="kitFee"
                value={formData.kitFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Fee (₹)
              </label>
              <input
                type="number"
                name="examFee"
                value={formData.examFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Fee (₹)
              </label>
              <input
                type="number"
                name="certificationFee"
                value={formData.certificationFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Charges (₹)
              </label>
              <input
                type="number"
                name="otherCharges"
                value={formData.otherCharges}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Payable Amount (₹)
              </label>
              <input
                type="number"
                name="totalPayableAmount"
                value={formData.totalPayableAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Scholarship */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            Scholarship
          </h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="scholarshipAvailable"
                checked={formData.scholarshipAvailable}
                onChange={handleChange}
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">Scholarship Available</span>
            </label>

            {formData.scholarshipAvailable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scholarship Details
                </label>
                <textarea
                  name="scholarshipDetails"
                  value={formData.scholarshipDetails}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe scholarship criteria, benefits, and application process..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Options */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Payment Options
          </h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="installmentAvailable"
                checked={formData.installmentAvailable}
                onChange={handleChange}
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">Installment / EMI Available</span>
            </label>

            {formData.installmentAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installment Schedule
                  </label>
                  <input
                    type="text"
                    name="installmentSchedule"
                    value={formData.installmentSchedule}
                    onChange={handleChange}
                    placeholder="E.g., 3 months, 6 months, 12 months"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EMI Provider
                  </label>
                  <input
                    type="text"
                    name="emiProvider"
                    value={formData.emiProvider}
                    onChange={handleChange}
                    placeholder="E.g., Bajaj Finserv, HDFC, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policies */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Policies
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Policy
              </label>
              <textarea
                name="refundPolicy"
                value={formData.refundPolicy}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your refund policy..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Policy
              </label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your cancellation policy..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
