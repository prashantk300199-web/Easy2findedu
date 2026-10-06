import { useState, useEffect, useRef } from 'react';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const FACILITIES = [
  { key: 'library', label: 'Library' },
  { key: 'laboratories', label: 'Laboratories' },
  { key: 'sportsFacilities', label: 'Sports Facilities' },
  { key: 'cafeteria', label: 'Cafeteria' },
  { key: 'auditorium', label: 'Auditorium' },
  { key: 'medicalFacilities', label: 'Medical Facilities' },
  { key: 'wifi', label: 'Wi-Fi Campus' },
  { key: 'transportation', label: 'Transportation' },
  { key: 'clubsActivities', label: 'Clubs & Activities' },
];

export default function Step6Facilities({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    library: !!data?.library,
    laboratories: !!data?.laboratories,
    sportsFacilities: !!data?.sportsFacilities,
    cafeteria: !!data?.cafeteria,
    auditorium: !!data?.auditorium,
    medicalFacilities: !!data?.medicalFacilities,
    wifi: !!data?.wifi,
    transportation: !!data?.transportation,
    clubsActivities: !!data?.clubsActivities,
    otherFacilities: data?.otherFacilities || '',
  });

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      library: data.library ?? prev.library,
      laboratories: data.laboratories ?? prev.laboratories,
      sportsFacilities: data.sportsFacilities ?? prev.sportsFacilities,
      cafeteria: data.cafeteria ?? prev.cafeteria,
      auditorium: data.auditorium ?? prev.auditorium,
      medicalFacilities: data.medicalFacilities ?? prev.medicalFacilities,
      wifi: data.wifi ?? prev.wifi,
      transportation: data.transportation ?? prev.transportation,
      clubsActivities: data.clubsActivities ?? prev.clubsActivities,
      otherFacilities: data.otherFacilities ?? prev.otherFacilities,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const toggle = (key: string) => setFormData((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-white mb-2">Facilities & Campus Life</h2>
      <p className="text-white/70 mb-8">Select all facilities your college provides.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FACILITIES.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key)}
              className={`p-4 border text-sm transition-colors ${
                formData[f.key as keyof typeof formData]
                  ? 'border-gold-500 bg-gold-500/10 text-white'
                  : 'border-night-700 bg-night-900 text-white/70 hover:border-gold-500/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">Other Facilities</label>
          <textarea
            value={formData.otherFacilities}
            onChange={(e) => setFormData((p) => ({ ...p, otherFacilities: e.target.value }))}
            rows={3}
            placeholder="Any additional facilities not listed above"
            className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">Previous</button>
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