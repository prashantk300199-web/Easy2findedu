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
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Faculty / Trainers / Mentors</h2>
      <p className="text-cream-100/60 mb-8">Provide information about your teaching staff</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Faculty Information */}
        <div className="border-b border-night-700 pb-6">
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <Users size={20} className="text-gold-400" />
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Total Faculty / Trainers
              </label>
              <input
                type="number"
                name="totalFaculty"
                value={formData.totalFaculty}
                onChange={handleChange}
                placeholder="E.g., 15"
                min="0"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Trainer-Student Ratio
              </label>
              <input
                type="text"
                name="trainerStudentRatio"
                value={formData.trainerStudentRatio}
                onChange={handleChange}
                placeholder="E.g., 1:20"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>
          </div>

          {/* Teaching Method */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-cream-100 mb-2">
              Teaching Method (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEACHING_METHODS.map(method => (
                <label
                  key={method}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    (formData.teachingMethod as string[]).includes(method)
                      ? 'border-gold-500 bg-gold-900/20'
                      : 'border-night-700 bg-night-900 hover:border-gold-500/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData.teachingMethod as string[]).includes(method)}
                    onChange={() => handleTeachingMethodToggle(method)}
                    className="mr-3 accent-gold-500"
                  />
                  <span className="text-sm text-cream-100">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Student Support */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-cream-100 mb-2">
              Student Support
            </label>
            <textarea
              name="studentSupport"
              value={formData.studentSupport}
              onChange={handleChange}
              rows={3}
              placeholder="Describe how you support students (e.g., study materials, doubt sessions, etc.)"
              className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
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
                className="mr-3 h-4 w-4 accent-gold-500"
              />
              <span className="text-sm text-cream-100">Doubt Support Available</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="oneToOneMentoring"
                checked={formData.oneToOneMentoring}
                onChange={handleChange}
                className="mr-3 h-4 w-4 accent-gold-500"
              />
              <span className="text-sm text-cream-100">1-to-1 Mentoring Available</span>
            </label>
          </div>
        </div>

        {/* Trainer Profiles */}
        <div>
          <h3 className="text-xl font-semibold text-cream-100 mb-6">Trainer Profiles (Optional)</h3>

          {!isAdding && (
            <div className="space-y-4 mb-6">
              {trainers.length === 0 ? (
                <div className="text-center py-12 bg-night-900/50 rounded-lg border-2 border-dashed border-night-700">
                  <Users className="mx-auto h-12 w-12 text-gold-400 mb-3" />
                  <p className="text-cream-100/60 mb-4">No trainer profiles added yet</p>
                  <button
                    type="button"
                    onClick={handleAddTrainer}
                    className="px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 inline-flex items-center gap-2 font-bold shadow-goldGlow transition-all"
                  >
                    <Plus size={18} />
                    Add Trainer Profile
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainers.map((trainer, index) => (
                      <div key={trainer.id} className="border border-night-700 bg-night-900 rounded-lg p-4 hover:shadow-goldGlow hover:border-gold-500/30 transition-all">
                        <div className="flex gap-4">
                          {trainer.photoPreview && (
                            <img
                              src={trainer.photoPreview}
                              alt={trainer.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gold-500/30"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-cream-100">{trainer.name}</h4>
                            {trainer.qualification && (
                              <p className="text-sm text-cream-100/70">{trainer.qualification}</p>
                            )}
                            {trainer.experience && (
                              <p className="text-sm text-cream-100/50">{trainer.experience} experience</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditTrainer(index)}
                              className="p-2 text-gold-400 hover:bg-night-700 rounded transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrainer(index)}
                              className="p-2 text-red-400 hover:bg-night-700 rounded transition-colors"
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
                    className="w-full py-4 border-2 border-dashed border-night-700 rounded-lg hover:border-gold-500 hover:bg-night-900/50 text-cream-100 hover:text-gold-400 font-semibold inline-flex items-center justify-center gap-2 transition-all"
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
            <div className="border border-gold-500/30 rounded-lg p-6 mb-6 bg-night-900/50">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold text-cream-100">
                  {editingIndex !== null ? 'Edit Trainer' : 'Add New Trainer'}
                </h4>
                <button type="button" onClick={handleCancel} className="text-cream-100/60 hover:text-cream-100">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    Profile Photo
                  </label>
                  <div className="mt-2">
                    {currentTrainer.photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={currentTrainer.photoPreview}
                          alt="Trainer preview"
                          className="w-32 h-32 rounded-full object-cover border-2 border-gold-500/30"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-night-700 border-dashed rounded-full cursor-pointer hover:bg-night-900/50 transition-colors">
                        <Upload className="w-8 h-8 text-gold-400" />
                        <p className="text-xs text-cream-100/60 mt-1">Upload</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.photo && <p className="text-red-400 text-sm mt-1">{errors.photo}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentTrainer.name}
                    onChange={handleTrainerChange}
                    placeholder="Trainer's full name"
                    className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all ${
                      errors.name ? 'border-red-500' : 'border-night-700'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Qualification & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-cream-100 mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={currentTrainer.qualification}
                      onChange={handleTrainerChange}
                      placeholder="E.g., M.Sc, B.Tech, Certified Professional"
                      className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cream-100 mb-2">
                      Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={currentTrainer.experience}
                      onChange={handleTrainerChange}
                      placeholder="E.g., 10 years"
                      className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                    />
                  </div>
                </div>

                {/* Specialization & Industry Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-cream-100 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={currentTrainer.specialization}
                      onChange={handleTrainerChange}
                      placeholder="Area of expertise"
                      className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cream-100 mb-2">
                      Industry Experience
                    </label>
                    <input
                      type="text"
                      name="industryExperience"
                      value={currentTrainer.industryExperience}
                      onChange={handleTrainerChange}
                      placeholder="E.g., 5 years in IT industry"
                      className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    Certifications
                  </label>
                  <textarea
                    name="certifications"
                    value={currentTrainer.certifications}
                    onChange={handleTrainerChange}
                    rows={2}
                    placeholder="List professional certifications..."
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    Achievements
                  </label>
                  <textarea
                    name="achievements"
                    value={currentTrainer.achievements}
                    onChange={handleTrainerChange}
                    rows={2}
                    placeholder="Notable achievements and awards..."
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-cream-100 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={currentTrainer.bio}
                    onChange={handleTrainerChange}
                    rows={3}
                    placeholder="Brief biography of the trainer..."
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTrainer}
                    className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 transition-all font-bold shadow-goldGlow"
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
              className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 disabled:opacity-50 transition-all font-bold shadow-goldGlow"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
