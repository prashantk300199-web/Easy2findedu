import { useState } from 'react';
import { Calendar, Users, FileCheck, Phone } from 'lucide-react';

interface Step8Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const ADMISSION_TYPES = [
  'Fixed Admission Cycle',
  'Rolling Admission',
  'Batch Based',
  'Anytime Enrollment',
  'Appointment Based'
];

export default function Step8Admission({ data, onNext, onBack, onSaveDraft, loading }: Step8Props) {
  const [formData, setFormData] = useState({
    admissionType: data?.admissionType || '',
    admissionProcess: data?.admissionProcess || '',
    admissionStartDate: data?.admissionStartDate || '',
    admissionEndDate: data?.admissionEndDate || '',
    nextBatchStartDate: data?.nextBatchStartDate || '',
    registrationDeadline: data?.registrationDeadline || '',
    applicationLink: data?.applicationLink || '',
    applicationFee: data?.applicationFee || '',
    requiredDocuments: data?.requiredDocuments || '',
    admissionContactPerson: data?.admissionContactPerson || '',
    admissionContactNumber: data?.admissionContactNumber || '',
    walkInAvailable: data?.walkInAvailable || false,
    demoAvailable: data?.demoAvailable || false
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateURL = (url: string) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validate = () => {
    const newErrors: any = {};

    if (formData.applicationLink && !validateURL(formData.applicationLink)) {
      newErrors.applicationLink = 'Enter a valid URL';
    }

    if (formData.admissionContactNumber && !validatePhone(formData.admissionContactNumber)) {
      newErrors.admissionContactNumber = 'Enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  const handleSave = () => {
    onSaveDraft(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Admission / Enrollment</h2>
      <p className="text-cream-100/60 mb-8">Provide admission and enrollment information</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Admission Type */}
        <div>
          <h3 className="text-xl font-semibold text-cream-100 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-gold-400" />
            Admission / Enrollment Type
          </h3>

          <select
            name="admissionType"
            value={formData.admissionType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
          >
            <option value="">Select Admission Type</option>
            {ADMISSION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <div className="mt-3 text-sm text-cream-100/50 space-y-1">
            <p><strong className="text-cream-100/70">Fixed Admission Cycle:</strong> Traditional academic calendar (e.g., yearly admissions)</p>
            <p><strong className="text-cream-100/70">Rolling Admission:</strong> Admissions open throughout the year</p>
            <p><strong className="text-cream-100/70">Batch Based:</strong> New batches start at regular intervals</p>
            <p><strong className="text-cream-100/70">Anytime Enrollment:</strong> Join anytime, no fixed schedule</p>
            <p><strong className="text-cream-100/70">Appointment Based:</strong> Schedule individual appointment for enrollment</p>
          </div>
        </div>

        {/* Admission Process */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Admission Process
          </label>
          <textarea
            name="admissionProcess"
            value={formData.admissionProcess}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your admission/enrollment process step by step..."
            className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
          />
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-xl font-semibold text-cream-100 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-gold-400" />
            Important Dates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Admission Start Date
              </label>
              <input
                type="date"
                name="admissionStartDate"
                value={formData.admissionStartDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Admission End Date
              </label>
              <input
                type="date"
                name="admissionEndDate"
                value={formData.admissionEndDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Next Batch Start Date
              </label>
              <input
                type="date"
                name="nextBatchStartDate"
                value={formData.nextBatchStartDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Registration Deadline
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-4 flex items-center gap-2">
            <FileCheck size={20} className="text-gold-400" />
            Application Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Application Link
              </label>
              <input
                type="url"
                name="applicationLink"
                value={formData.applicationLink}
                onChange={handleChange}
                placeholder="https://your-institute.com/apply"
                className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all ${
                  errors.applicationLink ? 'border-red-500' : 'border-night-700'
                }`}
              />
              {errors.applicationLink && (
                <p className="text-red-400 text-sm mt-1">{errors.applicationLink}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Application / Admission Fee (₹)
              </label>
              <input
                type="number"
                name="applicationFee"
                value={formData.applicationFee}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Required Documents
              </label>
              <textarea
                name="requiredDocuments"
                value={formData.requiredDocuments}
                onChange={handleChange}
                rows={4}
                placeholder="List required documents for admission (e.g., Photo ID, Educational certificates, etc.)"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-gold-400" />
            Admission Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Admission Contact Person
              </label>
              <input
                type="text"
                name="admissionContactPerson"
                value={formData.admissionContactPerson}
                onChange={handleChange}
                placeholder="Name of contact person"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Admission Contact Number
              </label>
              <input
                type="tel"
                name="admissionContactNumber"
                value={formData.admissionContactNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all ${
                  errors.admissionContactNumber ? 'border-red-500' : 'border-night-700'
                }`}
              />
              {errors.admissionContactNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.admissionContactNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="border-t border-night-700 pt-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-4 flex items-center gap-2">
            <Users size={20} className="text-gold-400" />
            Additional Options
          </h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="walkInAvailable"
                checked={formData.walkInAvailable}
                onChange={handleChange}
                className="mr-3 h-4 w-4 accent-gold-500"
              />
              <div>
                <span className="text-sm font-medium text-cream-100">Walk-in Available</span>
                <p className="text-xs text-cream-100/50">Students can visit and enroll directly</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="demoAvailable"
                checked={formData.demoAvailable}
                onChange={handleChange}
                className="mr-3 h-4 w-4 accent-gold-500"
              />
              <div>
                <span className="text-sm font-medium text-cream-100">Demo / Trial Before Enrollment</span>
                <p className="text-xs text-cream-100/50">Offer demo class or trial session</p>
              </div>
            </label>
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
