import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadDraftFile, isBlobUrl } from '../../lib/upload';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const GRADES = ['A++', 'A+', 'A', 'B++', 'B', 'C', 'Not Accredited'];

export default function Step3Affiliation({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    affiliatedUniversity: data?.affiliatedUniversity || '',
    ugcRecognized: !!data?.ugcRecognized,
    aicteApproved: !!data?.aicteApproved,
    naacAccredited: !!data?.naacAccredited,
    nbaAccredited: !!data?.nbaAccredited,
    nirfRank: data?.nirfRank || '',
    otherRecognition: data?.otherRecognition || '',
    accreditationGrade: data?.accreditationGrade || '',
    affiliationDocument: data?.affiliationDocument || '',
    recognitionDocument: data?.recognitionDocument || '',
    accreditationDocument: data?.accreditationDocument || '',
  });
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      affiliatedUniversity: data.affiliatedUniversity ?? prev.affiliatedUniversity,
      ugcRecognized: data.ugcRecognized ?? prev.ugcRecognized,
      aicteApproved: data.aicteApproved ?? prev.aicteApproved,
      naacAccredited: data.naacAccredited ?? prev.naacAccredited,
      nbaAccredited: data.nbaAccredited ?? prev.nbaAccredited,
      nirfRank: data.nirfRank ?? prev.nirfRank,
      otherRecognition: data.otherRecognition ?? prev.otherRecognition,
      accreditationGrade: data.accreditationGrade ?? prev.accreditationGrade,
      affiliationDocument: data.affiliationDocument ?? prev.affiliationDocument,
      recognitionDocument: data.recognitionDocument ?? prev.recognitionDocument,
      accreditationDocument: data.accreditationDocument ?? prev.accreditationDocument,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(fieldName);
    try {
      const url = await uploadDraftFile({
        file,
        stepNumber: 3,
        fieldName,
        endpoint: '/college-draft/draft/upload',
      });
      setFormData((p) => ({ ...p, [fieldName]: url }));
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'unknown'}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeDoc = (fieldName: string) => setFormData((p: any) => ({ ...p, [fieldName]: '' }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Affiliation & Recognition</h2>
      <p className="text-cream-100/60 mb-8">Tell us about your accreditations and recognitions.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Affiliated University" name="affiliatedUniversity" value={formData.affiliatedUniversity} onChange={handleChange} required={false} />

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-3">Recognitions & Approvals</label>
          <div className="grid grid-cols-2 gap-3">
            <Checkbox name="ugcRecognized" label="UGC Recognized" checked={formData.ugcRecognized} onChange={handleChange} />
            <Checkbox name="aicteApproved" label="AICTE Approved" checked={formData.aicteApproved} onChange={handleChange} />
            <Checkbox name="naacAccredited" label="NAAC Accredited" checked={formData.naacAccredited} onChange={handleChange} />
            <Checkbox name="nbaAccredited" label="NBA Accredited" checked={formData.nbaAccredited} onChange={handleChange} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="NIRF Ranking" name="nirfRank" type="number" value={String(formData.nirfRank || '')} onChange={handleChange} required={false} />
          <SelectField label="NAAC Grade" name="accreditationGrade" value={formData.accreditationGrade} onChange={handleChange} options={GRADES} required={false} />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">Other Recognition</label>
          <input
            name="otherRecognition"
            value={formData.otherRecognition}
            onChange={handleChange}
            placeholder="e.g. ISO 9001, NAAC A++, AICTE Approved"
            className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="border-t border-night-700 pt-6 space-y-4">
          <h3 className="font-display text-xl text-cream-100">Documents</h3>
          <DocUploader label="Affiliation Document" fieldName="affiliationDocument" url={formData.affiliationDocument} uploading={uploadingDoc === 'affiliationDocument'} onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handleDocUpload(e, 'affiliationDocument')} onRemove={() => removeDoc('affiliationDocument')} />
          <DocUploader label="Recognition Document" fieldName="recognitionDocument" url={formData.recognitionDocument} uploading={uploadingDoc === 'recognitionDocument'} onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handleDocUpload(e, 'recognitionDocument')} onRemove={() => removeDoc('recognitionDocument')} />
          <DocUploader label="Accreditation Document" fieldName="accreditationDocument" url={formData.accreditationDocument} uploading={uploadingDoc === 'accreditationDocument'} onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handleDocUpload(e, 'accreditationDocument')} onRemove={() => removeDoc('accreditationDocument')} />
        </div>

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
      <select name={name} value={value} onChange={onChange} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none">
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Checkbox({ name, label, checked, onChange }: any) {
  return (
    <label className={`flex items-center p-3 border cursor-pointer transition-colors ${checked ? 'border-gold-500 bg-gold-500/10' : 'border-night-700 bg-night-900 hover:border-gold-500/40'}`}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="mr-3" />
      <span className="text-sm text-cream-100">{label}</span>
    </label>
  );
}

function DocUploader({ label, url, uploading, onUpload, onRemove }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      {url ? (
        <div className="flex items-center gap-3 bg-night-900 border border-night-700 p-3">
          <span className="text-sm text-cream-100/80 flex-1 truncate">{url}</span>
          <a href={url} target="_blank" rel="noreferrer" className="text-gold-400 text-sm hover:underline">View</a>
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-300">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-3 bg-night-900 border border-night-700 border-dashed p-3 cursor-pointer hover:bg-night-800">
          <Upload size={18} className="text-gold-400" />
          <span className="text-sm text-cream-100/70">{uploading ? 'Uploading…' : 'Click to upload PDF / image'}</span>
          <input type="file" accept="image/*,application/pdf" onChange={onUpload} disabled={uploading} className="hidden" />
        </label>
      )}
    </div>
  );
}