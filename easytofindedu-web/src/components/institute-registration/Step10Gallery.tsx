import { useState } from 'react';
import { Image, Video, Globe, Instagram, Facebook, Linkedin, Youtube, Upload, X } from 'lucide-react';

interface Step10Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step10Gallery({ data, onNext, onBack, onSaveDraft, loading }: Step10Props) {
  const [formData, setFormData] = useState({
    galleryFiles: [] as File[],
    galleryPreviews: data?.galleryPreviews || [],
    videoUrl: data?.videoUrl || '',
    website: data?.website || '',
    instagram: data?.instagram || '',
    facebook: data?.facebook || '',
    linkedin: data?.linkedin || '',
    youtube: data?.youtube || ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev: any) => ({ ...prev, gallery: 'Each image must be less than 5MB' }));
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setErrors((prev: any) => ({ ...prev, gallery: 'Only image files are allowed' }));
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setFormData(prev => ({
      ...prev,
      galleryFiles: [...prev.galleryFiles, ...validFiles],
      galleryPreviews: [...prev.galleryPreviews, ...newPreviews]
    }));

    if (validFiles.length > 0 && errors.gallery) {
      setErrors((prev: any) => ({ ...prev, gallery: '' }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryFiles: prev.galleryFiles.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index)
    }));
  };

  const validateURL = (url: string) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (formData.videoUrl && !validateURL(formData.videoUrl)) {
      newErrors.videoUrl = 'Enter a valid YouTube, Vimeo, or video URL';
    }

    if (formData.website && !validateURL(formData.website)) {
      newErrors.website = 'Enter a valid website URL';
    }

    if (formData.instagram && !validateURL(formData.instagram)) {
      newErrors.instagram = 'Enter a valid Instagram profile URL';
    }

    if (formData.facebook && !validateURL(formData.facebook)) {
      newErrors.facebook = 'Enter a valid Facebook page URL';
    }

    if (formData.linkedin && !validateURL(formData.linkedin)) {
      newErrors.linkedin = 'Enter a valid LinkedIn profile URL';
    }

    if (formData.youtube && !validateURL(formData.youtube)) {
      newErrors.youtube = 'Enter a valid YouTube channel URL';
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery & Online Presence</h2>
      <p className="text-gray-600 mb-6">Showcase your institute and connect on social media</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Institute Gallery */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image size={20} />
            Institute Gallery Photos
          </h3>
          <p className="text-sm text-gray-500 mb-4">Upload multiple photos of your institute, classrooms, facilities, events, etc.</p>

          <div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload multiple images</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {errors.gallery && <p className="text-red-500 text-sm mt-1">{errors.gallery}</p>}
          </div>

          {formData.galleryPreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Images ({formData.galleryPreviews.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video URL */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Video size={20} />
            Institute / Campus Video
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL (YouTube / Vimeo)
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.videoUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Share a video tour, testimonial, or promotional video of your institute
            </p>
          </div>
        </div>

        {/* Online Presence */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} />
            Online Presence
          </h3>
          <p className="text-sm text-gray-500 mb-4">Connect your social media profiles and website</p>

          <div className="space-y-4">
            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe size={16} />
                Official Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://your-institute.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Instagram size={16} />
                Instagram Profile
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/your-institute"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.instagram ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.instagram && <p className="text-red-500 text-sm mt-1">{errors.instagram}</p>}
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Facebook size={16} />
                Facebook Page
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/your-institute"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.facebook ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.facebook && <p className="text-red-500 text-sm mt-1">{errors.facebook}</p>}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Linkedin size={16} />
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/your-institute"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.linkedin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Youtube size={16} />
                YouTube Channel
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@your-institute"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.youtube ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.youtube && <p className="text-red-500 text-sm mt-1">{errors.youtube}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
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
