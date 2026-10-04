import { useState, useEffect, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { uploadDraftFile } from '../../lib/upload';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const CATEGORIES = ['Registration', 'Affiliation', 'Recognition', 'Accreditation', 'Other'];

const emptyDoc = {
  category: '',
  documentName: '',
  documentFile: '',
  documentPreview: '',
  status: 'Pending',
};

const STATUS_BADGE: Record<string, string> = {
  Pending: 'border-amber-400/40 bg-amber-400/5 text-amber-300',
  Uploaded: 'border-blue-400/40 bg-blue-400/5 text-blue-300',
  Verified: 'border-green-400/40 bg-green-400/5 text-green-300',
  Rejected: 'border-red-400/40 bg-red-400/5 text-red-300',
  'Changes Required': 'border-amber-400/40 bg-amber-400/5 text-amber-300',
};

export default function Step11Documents({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [docs, setDocs] = useState<any[]>(data?.documents || []);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data?.documents) return;
    setDocs(data.documents);
    initialSyncDone.current = true;
  }, [data]);

  const update = (i: number, key: string, value: any) =>
    setDocs((arr) => arr.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)));

  const add = () => setDocs((arr) => [...arr, { ...emptyDoc, id: Date.now().toString() }]);
  const remove = (i: number) => setDocs((arr) => arr.filter((_, idx) => idx !== i));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(i);
    try {
      const url = await uploadDraftFile({
        file,
        stepNumber: 11,
        fieldName: 'documentFile',
        endpoint: '/college-draft/draft/upload',
      });
      update(i, 'documentFile', url);
      update(i, 'documentPreview', url);
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'unknown'}`);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ documents: docs });
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Official Documents</h2>
      <p className="text-cream-100/60 mb-8">Upload verification documents. These are private and only visible to admins.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {docs.map((d, i) => (
          <div key={i} className="border border-night-700 p-5 bg-night-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-cream-100">Document #{i + 1}</h3>
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
                <X size={18} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Select label="Category" value={d.category} onChange={(v: string) => update(i, 'category', v)} options={CATEGORIES} />
              <Field label="Document Name" value={d.documentName} onChange={(v: string) => update(i, 'documentName', v)} />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">File</label>
              {d.documentFile ? (
                <div className="flex items-center gap-3 bg-night-900 border border-night-700 p-3">
                  <FileText size={18} className="text-gold-400" />
                  <span className="text-sm text-cream-100/80 flex-1 truncate">{d.documentFile}</span>
                  <a href={d.documentFile} target="_blank" rel="noreferrer" className="text-gold-400 text-sm hover:underline">View</a>
                  <button type="button" onClick={() => { update(i, 'documentFile', ''); update(i, 'documentPreview', ''); }} className="text-red-400">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 bg-night-900 border border-night-700 border-dashed p-3 cursor-pointer">
                  <Upload size={18} className="text-gold-400" />
                  <span className="text-sm text-cream-100/70">{uploadingIdx === i ? 'Uploading…' : 'Click to upload PDF / image'}</span>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile(e, i)} disabled={uploadingIdx === i} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <span className={`inline-block border px-2 py-1 text-[11px] uppercase tracking-overline ${STATUS_BADGE[d.status] || STATUS_BADGE.Pending}`}>
                {d.status}
              </span>
              <p className="text-xs text-cream-100/50 mt-1">Status will be updated by admin after review.</p>
            </div>
          </div>
        ))}

        <button type="button" onClick={add}
          className="w-full border border-dashed border-gold-500/40 p-4 text-gold-400 hover:bg-gold-500/5">
          + Add document
        </button>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-cream-100 hover:bg-night-700 font-semibold">Previous</button>
          <button type="button" onClick={() => onSaveDraft({ documents: docs })} disabled={loading} className="px-6 py-3 border border-night-700 text-cream-100 hover:bg-night-700 font-semibold">
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

function Field({ label, value, onChange, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none">
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}