import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Upload, X } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  specialization: string;
  industryExperience: string;
  certifications: string;
  achievements: string;
  bio: string;
  photoFile: File | null;
  photoPreview: string;
}

interface Step6Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const emptyTrainer: Omit<Trainer, 'id'> = {
  name: '',
  qualification: '',
  experience: '',
  specialization: '',
  industryExperience: '',
  certifications: '',
  achievements: '',
  bio: '',
  photoFile: null,
  photoPreview: ''
};

const TEACHING_METHODS = [
  'Classroom Teaching',
  'Online Live Classes',
  'Recorded Lectures',
  'Practical Sessions',
  'Workshops',
  'One-on-One Training',
  'Group Discussion',
  'Project-Based Learning',
  'Hybrid (Online + Offline)'
];

export default function Step6Faculty({ data, onNext, onBack, onSaveDraft, loading }: Step6Props) {
  const [formData, setFormData] = useState({
    totalFaculty: data?.totalFaculty || '',
    trainerStudentRatio: data?.trainerStudentRatio || '',
    teachingMethod: data?.teachingMethod || [],
    studentSupport: data?.studentSupport || '',
    doubtSupport: data?.doubtSupport || false,
    oneToOneMentoring: data?.oneToOneMentoring || false
  });

  const [trainers, setTrainers] = useState<Trainer[]>(data?.trainers || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentTrainer, setCurrentTrainer] = useState<Omit<Trainer, 'id'>>(emptyTrainer);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTeachingMethodToggle = (method: string) => {
    setFormData(prev => {
      const methods = prev.teachingMethod as string[];
      if (methods.includes(method)) {
        return { ...prev, teachingMethod: methods.filter(m => m !== method) };
      } else {
        return { ...prev, teachingMethod: [...methods, method] };
      }
    });
  };

  const handleTrainerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTrainer(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev: any) => ({ ...prev, photo: 'File size must be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors((prev: any) => ({ ...prev, photo: 'Only image files are allowed' }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setCurrentTrainer(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: previewUrl
      }));

      if (errors.photo) {
        setErrors((prev: any) => ({ ...prev, photo: '' }));
      }
    }
  };

  const removePhoto = () => {
    setCurrentTrainer(prev => ({
      ...prev,
      photoFile: null,
      photoPreview: ''
    }));
  };

  const validateTrainer = () => {
    const newErrors: any = {};

    if (!currentTrainer.name.trim()) {
      newErrors.name = 'Trainer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrainer = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setCurrentTrainer(emptyTrainer);
    setErrors({});
  };

  const handleEditTrainer = (index: number) => {
    setEditingIndex(index);
    setIsAdding(true);
    const trainer = trainers[index];
    setCurrentTrainer({
      name: trainer.name,
      qualification: trainer.qualification,
      experience: trainer.experience,
      specialization: trainer.specialization,
      industryExperience: trainer.industryExperience,
      certifications: trainer.certifications,
      achievements: trainer.achievements,
      bio: trainer.bio,
      photoFile: trainer.photoFile,
      photoPreview: trainer.photoPreview
    });
    setErrors({});
  };

  const handleDeleteTrainer = (index: number) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      setTrainers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveTrainer = () => {
    if (validateTrainer()) {
      const newTrainer: Trainer = {
        ...currentTrainer,
        id: editingIndex !== null ? trainers[editingIndex].id : Date.now().toString()
      };

      if (editingIndex !== null) {
        setTrainers(prev => prev.map((t, i) => i === editingIndex ? newTrainer : t));
      } else {
        setTrainers(prev => [...prev, newTrainer]);
      }

      setIsAdding(false);
      setEditingIndex(null);
      setCurrentTrainer(emptyTrainer);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setCurrentTrainer(emptyTrainer);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      ...formData,
      trainers
    });
  };

  const handleSave = () => {
    onSaveDraft({
      ...formData,
      trainers
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Faculty / Trainers / Mentors</h2>
      <p className="text-gray-600 mb-6">Provide information about your teaching staff</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Faculty Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Faculty / Trainers
              </label>
              <input
                type="number"
                name="totalFaculty"
                value={formData.totalFaculty}
                onChange={handleChange}
                placeholder="E.g., 15"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trainer-Student Ratio
              </label>
              <input
                type="text"
                name="trainerStudentRatio"
                value={formData.trainerStudentRatio}
                onChange={handleChange}
                placeholder="E.g., 1:20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Teaching Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Method (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEACHING_METHODS.map(method => (
                <label
                  key={method}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    (formData.teachingMethod as string[]).includes(method)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData.teachingMethod as string[]).includes(method)}
                    onChange={() => handleTeachingMethodToggle(method)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Student Support */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Support
            </label>
            <textarea
              name="studentSupport"
              value={formData.studentSupport}
              onChange={handleChange}
              rows={3}
              placeholder="Describe how you support students (e.g., study materials, doubt sessions, etc.)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="doubtSupport"
                checked={formData.doubtSupport}
                onChange={handleChange}
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">Doubt Support Available</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="oneToOneMentoring"
                checked={formData.oneToOneMentoring}
                onChange={handleChange}
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">1-to-1 Mentoring Available</span>
            </label>
          </div>
        </div>

        {/* Trainer Profiles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trainer Profiles (Optional)</h3>

          {!isAdding && (
            <div className="space-y-4 mb-6">
              {trainers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">No trainer profiles added yet</p>
                  <button
                    type="button"
                    onClick={handleAddTrainer}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Trainer Profile
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainers.map((trainer, index) => (
                      <div key={trainer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          {trainer.photoPreview && (
                            <img
                              src={trainer.photoPreview}
                              alt={trainer.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{trainer.name}</h4>
                            {trainer.qualification && (
                              <p className="text-sm text-gray-600">{trainer.qualification}</p>
                            )}
                            {trainer.experience && (
                              <p className="text-sm text-gray-500">{trainer.experience} experience</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditTrainer(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrainer(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTrainer}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium inline-flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Another Trainer
                  </button>
                </>
              )}
            </div>
          )}

          {/* Trainer Form */}
          {isAdding && (
            <div className="border border-gray-300 rounded-lg p-6 mb-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {editingIndex !== null ? 'Edit Trainer' : 'Add New Trainer'}
                </h4>
                <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="mt-2">
                    {currentTrainer.photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={currentTrainer.photoPreview}
                          alt="Trainer preview"
                          className="w-32 h-32 rounded-full object-cover border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-full cursor-pointer hover:bg-gray-50">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-xs text-gray-400 mt-1">Upload</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentTrainer.name}
                    onChange={handleTrainerChange}
                    placeholder="Trainer's full name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Qualification & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={currentTrainer.qualification}
                      onChange={handleTrainerChange}
                      placeholder="E.g., M.Sc, B.Tech, Certified Professional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={currentTrainer.experience}
                      onChange={handleTrainerChange}
                      placeholder="E.g., 10 years"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Specialization & Industry Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={currentTrainer.specialization}
                      onChange={handleTrainerChange}
                      placeholder="Area of expertise"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Experience
                    </label>
                    <input
                      type="text"
                      name="industryExperience"
                      value={currentTrainer.industryExperience}
                      onChange={handleTrainerChange}
                      placeholder="E.g., 5 years in IT industry"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <textarea
                    name="certifications"
                    value={currentTrainer.certifications}
                    onChange={handleTrainerChange}
                    rows={2}
                    placeholder="List professional certifications..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achievements
                  </label>
                  <textarea
                    name="achievements"
                    value={currentTrainer.achievements}
                    onChange={handleTrainerChange}
                    rows={2}
                    placeholder="Notable achievements and awards..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={currentTrainer.bio}
                    onChange={handleTrainerChange}
                    rows={3}
                    placeholder="Brief biography of the trainer..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTrainer}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingIndex !== null ? 'Update Trainer' : 'Add Trainer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isAdding && (
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
        )}
      </form>
    </div>
  );
}
