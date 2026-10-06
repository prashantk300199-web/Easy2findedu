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

export default function Step10Gallery({ data, onNext, onBack, onSaveDraft, loading }: StepProps) {
  const [files, setFiles] = useState<string[]>(data?.galleryFiles || []);
  const [previews, setPreviews] = useState<string[]>(data?.galleryPreviews || []);
  const [social, setSocial] = useState({
    videoUrl: data?.videoUrl || '',
    website: data?.website || '',
    instagram: data?.instagram || '',
    facebook: data?.facebook || '',
    linkedin: data?.linkedin || '',
    youtube: data?.youtube || '',
  });
  const [uploading, setUploading] = useState(false);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFiles(data.galleryFiles || []);
    setPreviews(data.galleryPreviews || []);
    setSocial({
      videoUrl: data.videoUrl ?? '',
      website: data.website ?? '',
      instagram: data.instagram ?? '',
      facebook: data.facebook ?? '',
      linkedin: data.linkedin ?? '',
      youtube: data.youtube ?? '',
    });
    initialSyncDone.current = true;
  }, [data]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert('Max 5 MB per image');
      return;
    }
    const preview = URL.createObjectURL(f);
    setPreviews((p) => [...p, preview]);
    setUploading(true);
    try {
      const url = await uploadDraftFile({
        file: f,
        stepNumber: 10,
        fieldName: 'galleryFiles',
        endpoint: '/college-draft/draft/upload',
        append: true,
        arrayField: 'galleryFiles',
      });
      setFiles((arr) => [...arr, url]);
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'unknown'}`);
      setPreviews((p) => p.filter((pv) => pv !== preview));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i: number) => {
    setFiles((arr) => arr.filter((_, idx) => idx !== i));
    setPreviews((arr) => arr.filter((_, idx) => idx !== i));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocial((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ galleryFiles: files, galleryPreviews: files, ...social });
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-white mb-2">Gallery & Media</h2>
      <p className="text-white/70 mb-8">Upload images of your campus and infrastructure.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">Campus Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-32 object-cover border border-night-700" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-3 border border-night-700 border-dashed p-4 cursor-pointer hover:bg-night-900/40">
            <Upload size={18} className="text-[#D9C08E]" />
            <span className="text-white/70 text-sm">{uploading ? 'Uploading…' : 'Click to upload image'}</span>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        <div className="border-t border-night-700 pt-6 grid md:grid-cols-2 gap-6">
          <Field label="Video URL" name="videoUrl" value={social.videoUrl} onChange={handleSocialChange} placeholder="YouTube embed URL" required={false} />
          <Field label="Website" name="website" value={social.website} onChange={handleSocialChange} placeholder="https://" required={false} />
          <Field label="Instagram" name="instagram" value={social.instagram} onChange={handleSocialChange} required={false} />
          <Field label="Facebook" name="facebook" value={social.facebook} onChange={handleSocialChange} required={false} />
          <Field label="LinkedIn" name="linkedin" value={social.linkedin} onChange={handleSocialChange} required={false} />
          <Field label="YouTube" name="youtube" value={social.youtube} onChange={handleSocialChange} required={false} />
        </div>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">Previous</button>
          <button type="button" onClick={() => onSaveDraft({ galleryFiles: files, galleryPreviews: files, ...social })} disabled={loading} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">
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

function Field({ label, name, value, onChange, placeholder, required = true }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      <input name={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}