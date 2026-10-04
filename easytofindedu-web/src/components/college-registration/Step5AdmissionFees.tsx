import { useState, useEffect, useRef } from 'react';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step5AdmissionFees({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    admissionProcess: data?.admissionProcess || '',
    admissionStartDate: data?.admissionStartDate ? String(data.admissionStartDate).slice(0, 10) : '',
    admissionEndDate: data?.admissionEndDate ? String(data.admissionEndDate).slice(0, 10) : '',
    entranceExams: data?.entranceExams || '',
    eligibilityRequirements: data?.eligibilityRequirements || '',
    applicationProcedure: data?.applicationProcedure || '',
    feeStructureNote: data?.feeStructureNote || '',
    importantInfo: data?.importantInfo || '',
  });
  const [errors, setErrors] = useState<any>({});

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      admissionProcess: data.admissionProcess ?? prev.admissionProcess,
      admissionStartDate: data.admissionStartDate ? String(data.admissionStartDate).slice(0, 10) : prev.admissionStartDate,
      admissionEndDate: data.admissionEndDate ? String(data.admissionEndDate).slice(0, 10) : prev.admissionEndDate,
      entranceExams: data.entranceExams ?? prev.entranceExams,
      eligibilityRequirements: data.eligibilityRequirements ?? prev.eligibilityRequirements,
      applicationProcedure: data.applicationProcedure ?? prev.applicationProcedure,
      feeStructureNote: data.feeStructureNote ?? prev.feeStructureNote,
      importantInfo: data.importantInfo ?? prev.importantInfo,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p: any) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.admissionProcess.trim()) newErrors.admissionProcess = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Fees & Admissions</h2>
      <p className="text-cream-100/60 mb-8">Structured admission information and fees.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Textarea label="Admission Process *" name="admissionProcess" value={formData.admissionProcess} onChange={handleChange} error={errors.admissionProcess} rows={3} placeholder="e.g. Online application followed by entrance test" />

        <div className="grid md:grid-cols-2 gap-6">
          <DateField label="Admission Start Date" name="admissionStartDate" value={formData.admissionStartDate} onChange={handleChange} />
          <DateField label="Admission End Date" name="admissionEndDate" value={formData.admissionEndDate} onChange={handleChange} />
        </div>

        <Textarea label="Entrance Exams" name="entranceExams" value={formData.entranceExams} onChange={handleChange} rows={2} placeholder="e.g. JEE Main, NEET, CAT" required={false} />
        <Textarea label="Eligibility Requirements" name="eligibilityRequirements" value={formData.eligibilityRequirements} onChange={handleChange} rows={3} required={false} />
        <Textarea label="Application Procedure" name="applicationProcedure" value={formData.applicationProcedure} onChange={handleChange} rows={3} required={false} />
        <Textarea label="Fee Structure Summary" name="feeStructureNote" value={formData.feeStructureNote} onChange={handleChange} rows={3} placeholder="Tuition, exam, hostel, etc." required={false} />
        <Textarea label="Important Admission Information" name="importantInfo" value={formData.importantInfo} onChange={handleChange} rows={3} required={false} />

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

function Textarea({ label, name, value, onChange, error, rows = 3, placeholder, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none" />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function DateField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <input type="date" name={name} value={value || ''} onChange={onChange}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}