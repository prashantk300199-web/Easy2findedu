import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

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
    name: data?.name || '',
    instituteType: data?.instituteType || '',
    description: data?.description || '',
    detailedAbout: data?.detailedAbout || '',
    establishedYear: data?.establishedYear || '',
    ownershipType: data?.ownershipType || '',
    numberOfBranches: data?.numberOfBranches || 1,
    logoFile: null as File | null,
    coverImageFile: null as File | null,
    logoPreview: data?.logo?.url || '',
    coverImagePreview: data?.coverImage?.url || ''
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'coverImage') => {
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
      if (type === 'logo') {
        setFormData(prev => ({
          ...prev,
          logoFile: file,
          logoPreview: previewUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          coverImageFile: file,
          coverImagePreview: previewUrl
        }));
      }

      // Clear error
      if (errors[type]) {
        setErrors((prev: any) => ({ ...prev, [type]: '' }));
      }
    }
  };

  const removeFile = (type: 'logo' | 'coverImage') => {
    if (type === 'logo') {
      setFormData(prev => ({
        ...prev,
        logoFile: null,
        logoPreview: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        coverImageFile: null,
        coverImagePreview: ''
      }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Institute name is required';
    }

    if (!formData.instituteType) {
      newErrors.instituteType = 'Institute type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Short description is required';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    if (!formData.logoPreview && !formData.logoFile) {
      newErrors.logo = 'Institute logo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  const handleSave = () => {
    onSaveDraft(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Institute Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Institute Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g., Brilliant Academy, Tech Training Center"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Institute Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institute Type <span className="text-red-500">*</span>
          </label>
          <select
            name="instituteType"
            value={formData.instituteType}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.instituteType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Type</option>
            {INSTITUTE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.instituteType && <p className="text-red-500 text-sm mt-1">{errors.instituteType}</p>}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={200}
            placeholder="Brief description of your institute (max 200 characters)"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            <p className="text-gray-500 text-sm ml-auto">{formData.description.length}/200</p>
          </div>
        </div>

        {/* Detailed About */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed About
          </label>
          <textarea
            name="detailedAbout"
            value={formData.detailedAbout}
            onChange={handleChange}
            rows={5}
            placeholder="Provide detailed information about your institute..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Established Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Ownership Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ownership Type
          </label>
          <select
            name="ownershipType"
            value={formData.ownershipType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Ownership Type</option>
            {OWNERSHIP_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Number of Branches */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Branches
          </label>
          <input
            type="number"
            name="numberOfBranches"
            value={formData.numberOfBranches}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Institute Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institute Logo <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            {formData.logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={formData.logoPreview}
                  alt="Logo preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeFile('logo')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload logo</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="mt-2">
            {formData.coverImagePreview ? (
              <div className="relative inline-block">
                <img
                  src={formData.coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeFile('coverImage')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload cover image</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'coverImage')}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
