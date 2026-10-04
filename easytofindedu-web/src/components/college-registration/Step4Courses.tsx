import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { uploadDraftFile, isBlobUrl } from '../../lib/upload';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const emptyCourse = {
  courseName: '',
  degree: '',
  stream: '',
  specialization: '',
  duration: '',
  durationType: 'years',
  eligibility: '',
  admissionMode: '',
  entranceExam: '',
  intakeSeats: '',
  courseFee: '',
  applicationDeadline: '',
  description: '',
  brochureFile: '',
};

const DEGREES = ['Diploma', 'B.Tech', 'B.E.', 'B.Sc', 'B.A.', 'B.Com', 'BBA', 'BCA', 'MBBS', 'BDS', 'B.Pharm', 'LLB', 'B.Ed', 'M.Tech', 'M.Sc', 'M.A.', 'M.Com', 'MBA', 'MCA', 'MD', 'MDS', 'M.Pharm', 'LLM', 'M.Ed', 'Ph.D', 'Other'];
const ADMISSION_MODES = ['Entrance', 'Merit', 'Direct', 'Management Quota', 'Counselling'];

export default function Step4Courses({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [courses, setCourses] = useState<any[]>(data?.courses || [emptyCourse]);
  const [uploading, setUploading] = useState<number | null>(null);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data?.courses) return;
    setCourses(data.courses.length ? data.courses : [emptyCourse]);
    initialSyncDone.current = true;
  }, [data]);

  const update = (i: number, key: string, value: any) => {
    setCourses((arr) => arr.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  };

  const addCourse = () => setCourses((arr) => [...arr, { ...emptyCourse, id: Date.now().toString() }]);
  const removeCourse = (i: number) => setCourses((arr) => arr.filter((_, idx) => idx !== i));

  const handleBrochure = async (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(i);
    try {
      const url = await uploadDraftFile({
        file,
        stepNumber: 4,
        fieldName: 'brochureFile',
        endpoint: '/college-draft/draft/upload',
      });
      update(i, 'brochureFile', url);
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'unknown'}`);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCourses = courses.filter((c) => c.courseName && c.courseName.trim());
    if (validCourses.length === 0) {
      alert('Please add at least one course with a name.');
      return;
    }
    onNext({ courses: validCourses });
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Courses & Programs</h2>
      <p className="text-cream-100/60 mb-8">Add the courses/programs your college offers.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {courses.map((c, i) => (
          <div key={i} className="border border-night-700 p-5 bg-night-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-cream-100">Course #{i + 1}</h3>
              {courses.length > 1 && (
                <button type="button" onClick={() => removeCourse(i)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Course Name *" value={c.courseName} onChange={(v: string) => update(i, 'courseName', v)} />
              <Select label="Degree *" value={c.degree} onChange={(v: string) => update(i, 'degree', v)} options={DEGREES} />
              <Field label="Stream" value={c.stream} onChange={(v: string) => update(i, 'stream', v)} required={false} />
              <Field label="Specialization" value={c.specialization} onChange={(v: string) => update(i, 'specialization', v)} required={false} />
              <Field label="Duration" value={c.duration} onChange={(v: string) => update(i, 'duration', v)} placeholder="e.g. 4" />
              <Select label="Duration Unit" value={c.durationType || 'years'} onChange={(v: string) => update(i, 'durationType', v)} options={['years', 'months', 'semesters']} required={false} />
              <Field label="Eligibility" value={c.eligibility} onChange={(v: string) => update(i, 'eligibility', v)} required={false} />
              <Select label="Admission Mode" value={c.admissionMode} onChange={(v: string) => update(i, 'admissionMode', v)} options={ADMISSION_MODES} required={false} />
              <Field label="Entrance Exam" value={c.entranceExam} onChange={(v: string) => update(i, 'entranceExam', v)} placeholder="JEE Main, NEET, CAT…" required={false} />
              <Field label="Number of Seats" type="number" value={c.intakeSeats} onChange={(v: string) => update(i, 'intakeSeats', v)} required={false} />
              <Field label="Course Fee (INR/year)" type="number" value={c.courseFee} onChange={(v: string) => update(i, 'courseFee', v)} required={false} />
              <Field label="Application Deadline" type="date" value={c.applicationDeadline ? String(c.applicationDeadline).slice(0, 10) : ''} onChange={(v: string) => update(i, 'applicationDeadline', v)} required={false} />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">Description</label>
              <textarea
                value={c.description}
                onChange={(e) => update(i, 'description', e.target.value)}
                rows={2}
                className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">Brochure / Document</label>
              {c.brochureFile ? (
                <div className="flex items-center gap-3 bg-night-900 border border-night-700 p-3">
                  <span className="text-sm text-cream-100/80 flex-1 truncate">{c.brochureFile}</span>
                  <a href={c.brochureFile} target="_blank" rel="noreferrer" className="text-gold-400 text-sm hover:underline">View</a>
                  <button type="button" onClick={() => update(i, 'brochureFile', '')} className="text-red-400"><X size={16} /></button>
                </div>
              ) : (
                <label className="flex items-center gap-3 bg-night-900 border border-night-700 border-dashed p-3 cursor-pointer">
                  <Upload size={18} className="text-gold-400" />
                  <span className="text-sm text-cream-100/70">{uploading === i ? 'Uploading…' : 'Click to upload'}</span>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleBrochure(e, i)} disabled={uploading === i} className="hidden" />
                </label>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addCourse}
          className="w-full border border-dashed border-gold-500/40 p-4 text-gold-400 hover:bg-gold-500/5 flex items-center justify-center gap-2">
          <Plus size={18} /> Add another course
        </button>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-cream-100 hover:bg-night-700 font-semibold">Previous</button>
          <button type="button" onClick={() => onSaveDraft({ courses })} disabled={loading} className="px-6 py-3 border border-night-700 text-cream-100 hover:bg-night-700 font-semibold">
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
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}

function Select({ label, value, onChange, options, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none">
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}