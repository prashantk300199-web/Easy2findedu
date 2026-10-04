import { useState, useEffect, useRef } from 'react';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Dormitory', 'Shared'];

export default function Step7Hostel({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    isAvailable: !!data?.isAvailable,
    boysHostel: !!data?.boysHostel,
    girlsHostel: !!data?.girlsHostel,
    totalCapacity: data?.totalCapacity || '',
    hostelFees: data?.hostelFees || '',
    roomTypes: data?.roomTypes || '',
    hostelFacilities: data?.hostelFacilities || '',
    hostelRules: data?.hostelRules || '',
    contactPerson: data?.contactPerson || '',
    contactPhone: data?.contactPhone || '',
  });

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      isAvailable: data.isAvailable ?? prev.isAvailable,
      boysHostel: data.boysHostel ?? prev.boysHostel,
      girlsHostel: data.girlsHostel ?? prev.girlsHostel,
      totalCapacity: data.totalCapacity ?? prev.totalCapacity,
      hostelFees: data.hostelFees ?? prev.hostelFees,
      roomTypes: data.roomTypes ?? prev.roomTypes,
      hostelFacilities: data.hostelFacilities ?? prev.hostelFacilities,
      hostelRules: data.hostelRules ?? prev.hostelRules,
      contactPerson: data.contactPerson ?? prev.contactPerson,
      contactPhone: data.contactPhone ?? prev.contactPhone,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Hostel</h2>
      <p className="text-cream-100/60 mb-8">Do you offer hostel facilities?</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-night-700 p-4 bg-night-900/40">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <span className="text-cream-100">Yes, hostel facilities are available on campus</span>
          </label>
        </div>

        {formData.isAvailable && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-night-700 p-4 bg-night-900/40">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="boysHostel" checked={formData.boysHostel} onChange={handleChange} className="w-5 h-5" />
                  <span className="text-cream-100">Boys Hostel</span>
                </label>
              </div>
              <div className="border border-night-700 p-4 bg-night-900/40">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="girlsHostel" checked={formData.girlsHostel} onChange={handleChange} className="w-5 h-5" />
                  <span className="text-cream-100">Girls Hostel</span>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Total Capacity" type="number" name="totalCapacity" value={String(formData.totalCapacity || '')} onChange={handleChange} required={false} />
              <Field label="Hostel Fees (INR/month)" type="number" name="hostelFees" value={String(formData.hostelFees || '')} onChange={handleChange} required={false} />
            </div>

            <SelectField label="Room Types" name="roomTypes" value={formData.roomTypes} onChange={handleChange} options={ROOM_TYPES} required={false} />

            <Textarea label="Hostel Facilities" name="hostelFacilities" value={formData.hostelFacilities} onChange={handleChange} rows={3} placeholder="Wi-Fi, mess, laundry, gym…" required={false} />
            <Textarea label="Hostel Rules" name="hostelRules" value={formData.hostelRules} onChange={handleChange} rows={3} required={false} />

            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Warden / Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required={false} />
              <Field label="Contact Phone" type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required={false} />
            </div>
          </>
        )}

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-cream-100 hover:bg-night-700 font-semibold">Previous</button>
          <button type="button" onClick={() => onSaveDraft(formData)} disabled={loading} className="px-6 py-3 border border-night-700 text-cream-100 hover:bg-night-700 font-semibold">
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

function Field({ label, type = 'text', name, value, onChange, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <select name={name} value={value || ''} onChange={onChange} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none">
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, name, value, onChange, rows = 3, placeholder, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}