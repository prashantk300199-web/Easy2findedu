import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const emptyScholarship = {
  name: '',
  eligibility: '',
  amount: '',
  applicationProcess: '',
  deadline: '',
  description: '',
};

export default function Step9Scholarships({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [scholarships, setScholarships] = useState<any[]>(data?.scholarships || []);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data?.scholarships) return;
    setScholarships(data.scholarships);
    initialSyncDone.current = true;
  }, [data]);

  const update = (i: number, key: string, value: any) =>
    setScholarships((arr) => arr.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));

  const add = () => setScholarships((arr) => [...arr, { ...emptyScholarship, id: Date.now().toString() }]);
  const remove = (i: number) => setScholarships((arr) => arr.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ scholarships });
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-white mb-2">Scholarships</h2>
      <p className="text-white/70 mb-8">List any scholarships students can apply for.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {scholarships.map((s, i) => (
          <div key={i} className="border border-night-700 p-5 bg-night-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-white">Scholarship #{i + 1}</h3>
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
            <Field label="Scholarship Name" value={s.name} onChange={(v: string) => update(i, 'name', v)} />
            <Field label="Eligibility" value={s.eligibility} onChange={(v: string) => update(i, 'eligibility', v)} required={false} />
            <Field label="Amount / Benefit" value={s.amount} onChange={(v: string) => update(i, 'amount', v)} placeholder="e.g. ₹50,000 or 100% tuition" required={false} />
            <Textarea label="Application Process" value={s.applicationProcess} onChange={(v: string) => update(i, 'applicationProcess', v)} rows={2} required={false} />
            <Field label="Deadline" type="date" value={s.deadline ? String(s.deadline).slice(0, 10) : ''} onChange={(v: string) => update(i, 'deadline', v)} required={false} />
            <Textarea label="Description" value={s.description} onChange={(v: string) => update(i, 'description', v)} rows={2} required={false} />
          </div>
        ))}

        <button type="button" onClick={add}
          className="w-full border border-dashed border-gold-500/40 p-4 text-[#D9C08E] hover:bg-gold-500/5 flex items-center justify-center gap-2">
          <Plus size={18} /> Add scholarship
        </button>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">Previous</button>
          <button type="button" onClick={() => onSaveDraft({ scholarships })} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">
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

function Field({ label, type = 'text', value, onChange, placeholder, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 2, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} required={required}
        className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}