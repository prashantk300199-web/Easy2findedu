import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadDraftFile, isBlobUrl } from '../../lib/upload';

interface Step1Props {
  data?: any;
  onNext: (data: any) => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const INSTITUTE_TYPES = [
  'Coaching Institute',
  'Training Center',
  'Academy',
  'School',
  'College',
  'University',
  'Other'
];

const OWNERSHIP_TYPES = [
  'Individual',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'Trust',
  'Society',
  'Other'
];

export default function Step1InstituteInfo({ data, onNext, onSaveDraft, loading }: Step1Props) {
  const [formData, setFormData] = useState({
    instituteName: data?.instituteName || '',
    instituteType: data?.instituteType || '',
    about: data?.about || '',
    establishedYear: data?.establishedYear || '',
    ownershipType: data?.ownershipType || '',
    totalBranches: data?.totalBranches || 1,
    logoFile: data?.logoFile || '',
    coverImageFile: data?.coverImageFile || '',
    logoPreview: data?.logoPreview || '',
    coverImagePreview: data?.coverImagePreview || ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const [uploading, setUploading] = useState<'logo' | 'coverImage' | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev: any) => ({
          ...prev,
          [type]: 'File size must be less than 5MB'
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev: any) => ({
          ...prev,
          [type]: 'Only image files are allowed'
        }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      // Set preview immediately for better UX
      if (type === 'logo') {
        setFormData(prev => ({
          ...prev,
          logoPreview: previewUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          coverImagePreview: previewUrl
        }));
      }

      // Clear error
      if (errors[type]) {
        setErrors((prev: any) => ({ ...prev, [type]: '' }));
      }

      // Upload to cloud storage and only then write the real URL.
      // Until that returns, the slot shows the blob preview + an
      // 'Uploading…' state and the form cannot be submitted.
      setUploading(type);
      try {
        const url = await uploadDraftFile({
          file,
          stepNumber: 1,
          fieldName: type === 'logo' ? 'logoFile' : 'coverImageFile',
        });
        if (type === 'logo') {
          setFormData(prev => ({ ...prev, logoFile: url, logoPreview: url }));
        } else {
          setFormData(prev => ({ ...prev, coverImageFile: url, coverImagePreview: url }));
        }
      } catch (err: any) {
        setErrors((prev: any) => ({
          ...prev,
          [type]: `Upload failed: ${err?.message || 'unknown error'}. Please try again.`,
        }));
      } finally {
        setUploading(null);
      }
    }
  };

  const removeFile = (type: 'logo' | 'coverImage') => {
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: '',
      [`${type}Preview`]: '',
    }));
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    }

    if (!formData.instituteType) {
      newErrors.instituteType = 'Institute type is required';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'Short description is required';
    } else if (formData.about.length > 200) {
      newErrors.about = 'Description must be 200 characters or less';
    }

    if (!formData.logoFile) {
      newErrors.logo = 'Institute logo is required. Please wait for the upload to complete.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isUploading = uploading !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      setErrors((prev: any) => ({ ...prev, _form: 'A file is still uploading. Please wait.' }));
      return;
    }
    if (validate()) {
      onNext(formData);
    }
  };

  const handleSave = () => {
    if (isUploading) {
      setErrors((prev: any) => ({ ...prev, _form: 'A file is still uploading. Please wait.' }));
      return;
    }
    onSaveDraft(formData);
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Institute Information</h2>
      <p className="text-cream-100/60 mb-8">Let's start with basic details about your institute</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Institute Name */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Institute Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="instituteName"
            value={formData.instituteName}
            onChange={handleChange}
            placeholder="E.g., Brilliant Academy, Tech Training Center"
            className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
              errors.instituteName ? 'border-red-500' : 'border-night-700'
            }`}
          />
          {errors.instituteName && <p className="text-red-400 text-sm mt-1">{errors.instituteName}</p>}
        </div>

        {/* Institute Type */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Institute Type <span className="text-red-400">*</span>
          </label>
          <select
            name="instituteType"
            value={formData.instituteType}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
              errors.instituteType ? 'border-red-500' : 'border-night-700'
            }`}
          >
            <option value="">Select Type</option>
            {INSTITUTE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.instituteType && <p className="text-red-400 text-sm mt-1">{errors.instituteType}</p>}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Short Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={3}
            maxLength={200}
            placeholder="Brief description of your institute (max 200 characters)"
            className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
              errors.about ? 'border-red-500' : 'border-night-700'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.about && <p className="text-red-400 text-sm">{errors.about}</p>}
            <p className="text-cream-100/50 text-sm ml-auto">{formData.about.length}/200</p>
          </div>
        </div>

        {/* Established Year */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Established Year
          </label>
          <input
            type="number"
            name="establishedYear"
            value={formData.establishedYear}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            placeholder={new Date().getFullYear().toString()}
            className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
          />
        </div>

        {/* Ownership Type */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Ownership Type
          </label>
          <select
            name="ownershipType"
            value={formData.ownershipType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
          >
            <option value="">Select Ownership Type</option>
            {OWNERSHIP_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Number of Branches */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Number of Branches
          </label>
          <input
            type="number"
            name="totalBranches"
            value={formData.totalBranches}
            onChange={handleChange}
            min="1"
            placeholder="Enter number of branches"
            className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
          />
        </div>

        {/* Institute Logo */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Institute Logo <span className="text-red-400">*</span>
          </label>
          <div className="mt-2">
            {formData.logoPreview ? (
              <div className="relative inline-block">
                {!isBlobUrl(formData.logoPreview) ? (
                  <img
                    src={formData.logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gold-500/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gold-500/30 bg-night-900 flex flex-col items-center justify-center text-xs text-cream-100/60">
                    <Upload size={20} className="text-gold-400 mb-1" />
                    {uploading === 'logo' ? 'Uploading…' : 'Awaiting upload…'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile('logo')}
                  disabled={uploading === 'logo'}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-night-700 border-dashed rounded-lg cursor-pointer hover:bg-night-900/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gold-400" />
                  <p className="text-sm text-cream-100">Click to upload logo</p>
                  <p className="text-xs text-cream-100/50">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden"
                  disabled={uploading === 'logo'}
                />
              </label>
            )}
            {uploading === 'logo' && (
              <p className="text-xs text-gold-400 mt-1">Uploading logo to cloud storage…</p>
            )}
          </div>
          {errors.logo && <p className="text-red-400 text-sm mt-1">{errors.logo}</p>}
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-2">
            Cover Image
          </label>
          <div className="mt-2">
            {formData.coverImagePreview ? (
              <div className="relative inline-block w-full">
                {!isBlobUrl(formData.coverImagePreview) ? (
                  <img
                    src={formData.coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gold-500/30"
                  />
                ) : (
                  <div className="w-full h-48 rounded-lg border-2 border-dashed border-gold-500/30 bg-night-900 flex flex-col items-center justify-center text-xs text-cream-100/60">
                    <Upload size={20} className="text-gold-400 mb-1" />
                    {uploading === 'coverImage' ? 'Uploading…' : 'Awaiting upload…'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile('coverImage')}
                  disabled={uploading === 'coverImage'}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-night-700 border-dashed rounded-lg cursor-pointer hover:bg-night-900/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gold-400" />
                  <p className="text-sm text-cream-100">Click to upload cover image</p>
                  <p className="text-xs text-cream-100/50">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'coverImage')}
                  className="hidden"
                  disabled={uploading === 'coverImage'}
                />
              </label>
            )}
            {uploading === 'coverImage' && (
              <p className="text-xs text-gold-400 mt-1">Uploading cover image to cloud storage…</p>
            )}
          </div>
          {errors.coverImage && <p className="text-red-400 text-sm mt-1">{errors.coverImage}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || isUploading}
            className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
          >
            {loading ? 'Saving...' : isUploading ? 'Uploading…' : 'Save Draft'}
          </button>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 disabled:opacity-50 transition-all font-bold shadow-goldGlow"
          >
            {loading ? 'Saving...' : isUploading ? 'Uploading…' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
