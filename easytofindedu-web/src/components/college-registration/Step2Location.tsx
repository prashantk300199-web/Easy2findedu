import { useState, useEffect, useRef } from 'react';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step2Location({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    fullAddress: data?.fullAddress || '',
    city: data?.city || '',
    district: data?.district || '',
    state: data?.state || '',
    pincode: data?.pincode || '',
    country: data?.country || 'India',
    googleMapsLink: data?.googleMapsLink || '',
    campusName: data?.campusName || '',
    campusType: data?.campusType || '',
    campusDescription: data?.campusDescription || '',
  });
  const [errors, setErrors] = useState<any>({});

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      fullAddress: data.fullAddress ?? prev.fullAddress,
      city: data.city ?? prev.city,
      district: data.district ?? prev.district,
      state: data.state ?? prev.state,
      pincode: data.pincode ?? prev.pincode,
      country: data.country ?? prev.country,
      googleMapsLink: data.googleMapsLink ?? prev.googleMapsLink,
      campusName: data.campusName ?? prev.campusName,
      campusType: data.campusType ?? prev.campusType,
      campusDescription: data.campusDescription ?? prev.campusDescription,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.state.trim()) newErrors.state = 'Required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-white mb-2">Location & Campus</h2>
      <p className="text-white/70 mb-8">Where is your college located?</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">Full Address *</label>
          <textarea
            name="fullAddress"
            value={formData.fullAddress}
            onChange={handleChange}
            rows={3}
            className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none"
            placeholder="Street address, building, area"
          />
          {errors.fullAddress && <p className="text-red-400 text-sm mt-1">{errors.fullAddress}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="City *" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
          <Field label="District" name="district" value={formData.district} onChange={handleChange} required={false} />
          <Field label="State *" name="state" value={formData.state} onChange={handleChange} error={errors.state} />
          <Field label="PIN Code *" name="pincode" value={formData.pincode} onChange={handleChange} error={errors.pincode} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Country" name="country" value={formData.country} onChange={handleChange} required={false} />
          <Field label="Google Maps Link" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/…" required={false} />
        </div>

        <div className="border-t border-night-700 pt-6">
          <h3 className="font-display text-xl text-white mb-4">Campus Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Campus Name" name="campusName" value={formData.campusName} onChange={handleChange} placeholder="e.g. Main Campus, North Campus" required={false} />
            <Field label="Campus Type" name="campusType" value={formData.campusType} onChange={handleChange} placeholder="e.g. Urban, Rural, Suburban" required={false} />
          </div>
          <div className="mt-4">
            <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">Campus Description</label>
            <textarea
              name="campusDescription"
              value={formData.campusDescription}
              onChange={handleChange}
              rows={3}
              className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none"
              placeholder="Short description of your campus"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">
            Previous
          </button>
          <button type="button" onClick={() => onSaveDraft(formData)} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">
            {loading ? 'Saving…' : 'Save Draft'}
          </button>
          <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gold-500 text-night-900 hover:bg-gold-400 font-bold">
            {loading ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required = true, error }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none"
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}