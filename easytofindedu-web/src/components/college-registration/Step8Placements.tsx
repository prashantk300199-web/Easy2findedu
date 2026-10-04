import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadDraftFile } from '../../lib/upload';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step8Placements({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    placementCell: !!data?.placementCell,
    placementAssistance: !!data?.placementAssistance,
    averagePackage: data?.averagePackage || '',
    highestPackage: data?.highestPackage || '',
    placementRate: data?.placementRate || '',
    topRecruiters: data?.topRecruiters || '',
    internshipOpportunities: !!data?.internshipOpportunities,
    placementDescription: data?.placementDescription || '',
    placementReportFile: data?.placementReportFile || '',
  });
  const [uploading, setUploading] = useState(false);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      placementCell: data.placementCell ?? prev.placementCell,
      placementAssistance: data.placementAssistance ?? prev.placementAssistance,
      averagePackage: data.averagePackage ?? prev.averagePackage,
      highestPackage: data.highestPackage ?? prev.highestPackage,
      placementRate: data.placementRate ?? prev.placementRate,
      topRecruiters: data.topRecruiters ?? prev.topRecruiters,
      internshipOpportunities: data.internshipOpportunities ?? prev.internshipOpportunities,
      placementDescription: data.placementDescription ?? prev.placementDescription,
      placementReportFile: data.placementReportFile ?? prev.placementReportFile,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadDraftFile({
        file,
        stepNumber: 8,
        fieldName: 'placementReportFile',
        endpoint: '/college-draft/draft/upload',
      });
      setFormData((p) => ({ ...p, placementReportFile: url }));
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'unknown'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Placements</h2>
      <p className="text-cream-100/60 mb-8">Provide placement information where available.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-night-700 p-4 bg-night-900/40">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="placementCell" checked={formData.placementCell} onChange={handleChange} className="w-5 h-5" />
              <span className="text-cream-100">Placement Cell</span>
            </label>
          </div>
          <div className="border border-night-700 p-4 bg-night-900/40">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="placementAssistance" checked={formData.placementAssistance} onChange={handleChange} className="w-5 h-5" />
              <span className="text-cream-100">Placement Assistance</span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Field label="Average Package (LPA)" type="number" name="averagePackage" value={String(formData.averagePackage || '')} onChange={handleChange} required={false} />
          <Field label="Highest Package (LPA)" type="number" name="highestPackage" value={String(formData.highestPackage || '')} onChange={handleChange} required={false} />
          <Field label="Placement Rate (%)" type="number" name="placementRate" value={String(formData.placementRate || '')} onChange={handleChange} required={false} />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">Top Recruiters</label>
          <input
            name="topRecruiters"
            value={formData.topRecruiters}
            onChange={handleChange}
            placeholder="Comma-separated: TCS, Infosys, Wipro…"
            className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="border border-night-700 p-4 bg-night-900/40">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="internshipOpportunities" checked={formData.internshipOpportunities} onChange={handleChange} className="w-5 h-5" />
            <span className="text-cream-100">Internship Opportunities Available</span>
          </label>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">Placement Description</label>
          <textarea
            name="placementDescription"
            value={formData.placementDescription}
            onChange={handleChange}
            rows={3}
            className="w-full bg-night-900 border border-night-700 text-cream-100 p-3 focus:border-gold-500 focus:outline-none"
            placeholder="Brief overview of the placement program"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">Placement Report Document</label>
          {formData.placementReportFile ? (
            <div className="flex items-center gap-3 bg-night-900 border border-night-700 p-3">
              <span className="text-sm text-cream-100/80 flex-1 truncate">{formData.placementReportFile}</span>
              <a href={formData.placementReportFile} target="_blank" rel="noreferrer" className="text-gold-400 text-sm hover:underline">View</a>
              <button type="button" onClick={() => setFormData((p) => ({ ...p, placementReportFile: '' }))} className="text-red-400">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-night-900 border border-night-700 border-dashed p-3 cursor-pointer">
              <Upload size={18} className="text-gold-400" />
              <span className="text-sm text-cream-100/70">{uploading ? 'Uploading…' : 'Click to upload PDF / image'}</span>
              <input type="file" accept="image/*,application/pdf" onChange={handleReportUpload} disabled={uploading} className="hidden" />
            </label>
          )}
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