import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadDraftFile, isBlobUrl } from '../../lib/upload';

interface StepProps {
  data?: any;
  onNext: (data: any) => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const INSTITUTION_TYPES = [
  'Engineering', 'Medical', 'Management', 'Law', 'Arts & Science',
  'Commerce', 'Pharmacy', 'Nursing', 'Dental', 'Architecture',
  'Education', 'Agriculture', 'Veterinary', 'Other',
];

const OWNERSHIP_TYPES = ['Public', 'Private', 'PPP', 'Government'];

export default function Step1BasicInfo({ data, onNext, onSaveDraft, loading }: StepProps) {
  const [formData, setFormData] = useState({
    collegeName: data?.collegeName || '',
    shortName: data?.shortName || '',
    establishedYear: data?.establishedYear || '',
    institutionType: data?.institutionType || '',
    ownershipType: data?.ownershipType || '',
    about: data?.about || '',
    website: data?.website || '',
    contactEmail: data?.contactEmail || '',
    contactPhone: data?.contactPhone || '',
    logoFile: data?.logoFile || '',
    logoPreview: data?.logoPreview || '',
    coverImageFile: data?.coverImageFile || '',
    coverImagePreview: data?.coverImagePreview || '',
  });
  const [errors, setErrors] = useState<any>({});
  const [uploading, setUploading] = useState<'logo' | 'coverImage' | null>(null);

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current || !data) return;
    setFormData((prev) => ({
      collegeName: data.collegeName ?? prev.collegeName,
      shortName: data.shortName ?? prev.shortName,
      establishedYear: data.establishedYear ?? prev.establishedYear,
      institutionType: data.institutionType ?? prev.institutionType,
      ownershipType: data.ownershipType ?? prev.ownershipType,
      about: data.about ?? prev.about,
      website: data.website ?? prev.website,
      contactEmail: data.contactEmail ?? prev.contactEmail,
      contactPhone: data.contactPhone ?? prev.contactPhone,
      logoFile: data.logoFile ?? prev.logoFile,
      logoPreview: data.logoPreview ?? prev.logoPreview,
      coverImageFile: data.coverImageFile ?? prev.coverImageFile,
      coverImagePreview: data.coverImagePreview ?? prev.coverImagePreview,
    }));
    initialSyncDone.current = true;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p: any) => ({ ...p, [type]: 'Max 5 MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors((p: any) => ({ ...p, [type]: 'Image files only' }));
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (type === 'logo') {
      setFormData((p: any) => ({ ...p, logoPreview: previewUrl }));
    } else {
      setFormData((p: any) => ({ ...p, coverImagePreview: previewUrl }));
    }
    setUploading(type);
    try {
      const url = await uploadDraftFile({
        file,
        stepNumber: 1,
        fieldName: type === 'logo' ? 'logoFile' : 'coverImageFile',
        endpoint: '/college-draft/draft/upload',
      });
      if (type === 'logo') {
        setFormData((p: any) => ({ ...p, logoFile: url, logoPreview: url }));
      } else {
        setFormData((p: any) => ({ ...p, coverImageFile: url, coverImagePreview: url }));
      }
    } catch (err: any) {
      setErrors((p: any) => ({ ...p, [type]: `Upload failed: ${err?.message || 'unknown'}` }));
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (type: 'logo' | 'coverImage') => {
    if (type === 'logo') {
      setFormData((p: any) => ({ ...p, logoFile: '', logoPreview: '' }));
    } else {
      setFormData((p: any) => ({ ...p, coverImageFile: '', coverImagePreview: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.institutionType) newErrors.institutionType = 'Institution type is required';
    if (!formData.about.trim()) newErrors.about = 'About is required';
    if (formData.about.length > 1000) newErrors.about = 'Max 1000 characters';
    if (!formData.logoFile) newErrors.logo = 'Logo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      setErrors((p: any) => ({ ...p, _form: 'A file is still uploading. Please wait.' }));
      return;
    }
    if (validate()) onNext(formData);
  };

  const handleSave = () => {
    if (uploading) return;
    onSaveDraft(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-white mb-2">College Basic Information</h2>
      <p className="text-white/70 mb-8">Start with the basics about your college.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Official College Name *" name="collegeName" value={formData.collegeName} onChange={handleChange} error={errors.collegeName} />
        <Field label="Short / Display Name" name="shortName" value={formData.shortName} onChange={handleChange} required={false} />

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Established Year" name="establishedYear" type="number" value={String(formData.establishedYear || '')} onChange={handleChange} placeholder={String(new Date().getFullYear())} />
          <SelectField label="Institution Type *" name="institutionType" value={formData.institutionType} onChange={handleChange} options={INSTITUTION_TYPES} error={errors.institutionType} />
        </div>

        <SelectField label="Ownership Type" name="ownershipType" value={formData.ownershipType} onChange={handleChange} options={OWNERSHIP_TYPES} required={false} />

        <div>
          <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">About College *</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={4}
            maxLength={1000}
            placeholder="Brief description of your college (max 1000 characters)"
            className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none"
          />
          {errors.about && <p className="text-red-400 text-sm mt-1">{errors.about}</p>}
        </div>

        <Field label="College Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://" required={false} />
        <Field label="Official Contact Email" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} required={false} />
        <Field label="Official Contact Phone" name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} required={false} />

        <FileField
          label="College Logo *"
          preview={formData.logoPreview}
          uploading={uploading === 'logo'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'logo')}
          onRemove={() => removeFile('logo')}
          error={errors.logo}
        />
        <FileField
          label="Cover Image"
          preview={formData.coverImagePreview}
          uploading={uploading === 'coverImage'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'coverImage')}
          onRemove={() => removeFile('coverImage')}
          error={errors.coverImage}
          aspect="h-48"
        />

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={handleSave} disabled={loading || !!uploading}
            style={{ color: '#FBF8F2', borderColor: '#0C1424' }}
            className="px-6 py-3 border hover:opacity-80 disabled:opacity-50 font-semibold">
            {loading ? 'Saving…' : uploading ? 'Uploading…' : 'Save Draft'}
          </button>
          <button type="submit" disabled={loading || !!uploading}
            style={{ backgroundColor: '#C9A96A', color: '#050912' }}
            className="flex-1 px-6 py-3 hover:opacity-90 disabled:opacity-50 font-bold">
            {loading ? 'Saving…' : uploading ? 'Uploading…' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', name, value, onChange, placeholder, required = true, error }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      <input
        type={type}
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

function SelectField({ label, name, value, onChange, options, required = true, error }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-night-900 border border-night-700 text-white p-3 focus:border-gold-500 focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FileField({ label, preview, uploading, onChange, onRemove, error, aspect = 'w-32 h-32' }: any) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-overline text-[#B39055] mb-2">{label}</label>
      {preview ? (
        <div className="relative inline-block">
          {!isBlobUrl(preview) ? (
            <img src={preview} alt={label} className={`${aspect} object-cover border-2 border-gold-500/30`} />
          ) : (
            <div className={`${aspect} border-2 border-dashed border-gold-500/30 bg-night-900 flex items-center justify-center text-xs text-white/70`}>
              <Upload size={20} className="text-[#D9C08E] mr-2" /> {uploading ? 'Uploading…' : 'Awaiting'}
            </div>
          )}
          <button type="button" onClick={onRemove} disabled={uploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 disabled:opacity-30">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full border-2 border-night-700 border-dashed p-6 cursor-pointer hover:bg-night-900/50 ${aspect}`}>
          <Upload className="text-[#D9C08E] mb-2" size={24} />
          <span className="text-sm text-white">Click to upload</span>
          <span className="text-xs text-white/50 mt-1">PNG / JPG up to 5 MB</span>
          <input type="file" accept="image/*" onChange={onChange} disabled={uploading} className="hidden" />
        </label>
      )}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}