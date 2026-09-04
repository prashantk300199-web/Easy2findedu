import { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  category: string;
  level: string;
  duration: string;
  mode: string;
  eligibility: string;
  minAge: string;
  maxAge: string;
  totalFees: string;
  seats: string;
  description: string;
  certificationAvailable: boolean;
  certificateAuthority: string;
  trialAvailable: boolean;
  practicalTraining: boolean;
  outcomes: string;
  skills: string;
  entranceExamRequired: boolean;
  entranceExamName: string;
}

interface Step4Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const COURSE_MODES = ['Online', 'Offline', 'Hybrid'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'Other'];

const emptyC ourse: Omit<Course, 'id'> = {
  name: '',
  category: '',
  level: '',
  duration: '',
  mode: '',
  eligibility: '',
  minAge: '',
  maxAge: '',
  totalFees: '',
  seats: '',
  description: '',
  certificationAvailable: false,
  certificateAuthority: '',
  trialAvailable: false,
  practicalTraining: false,
  outcomes: '',
  skills: '',
  entranceExamRequired: false,
  entranceExamName: ''
};

export default function Step4Courses({ data, onNext, onBack, onSaveDraft, loading }: Step4Props) {
  const [courses, setCourses] = useState<Course[]>(data?.courses || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Omit<Course, 'id'>>(emptyCourse);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentCourse(prev => ({ ...prev, [name]: checked }));
    } else {
      setCurrentCourse(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!currentCourse.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!currentCourse.mode) {
      newErrors.mode = 'Course mode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCourse = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setCurrentCourse(emptyCourse);
    setErrors({});
  };

  const handleEditCourse = (index: number) => {
    setEditingIndex(index);
    setIsAdding(true);
    const course = courses[index];
    setCurrentCourse({
      name: course.name,
      category: course.category,
      level: course.level,
      duration: course.duration,
      mode: course.mode,
      eligibility: course.eligibility,
      minAge: course.minAge,
      maxAge: course.maxAge,
      totalFees: course.totalFees,
      seats: course.seats,
      description: course.description,
      certificationAvailable: course.certificationAvailable,
      certificateAuthority: course.certificateAuthority,
      trialAvailable: course.trialAvailable,
      practicalTraining: course.practicalTraining,
      outcomes: course.outcomes,
      skills: course.skills,
      entranceExamRequired: course.entranceExamRequired,
      entranceExamName: course.entranceExamName
    });
    setErrors({});
  };

  const handleDeleteCourse = (index: number) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveCourse = () => {
    if (validate()) {
      const newCourse: Course = {
        ...currentCourse,
        id: editingIndex !== null ? courses[editingIndex].id : Date.now().toString()
      };

      if (editingIndex !== null) {
        setCourses(prev => prev.map((c, i) => i === editingIndex ? newCourse : c));
      } else {
        setCourses(prev => [...prev, newCourse]);
      }

      setIsAdding(false);
      setEditingIndex(null);
      setCurrentCourse(emptyCourse);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setCurrentCourse(emptyCourse);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ courses });
  };

  const handleSave = () => {
    onSaveDraft({ courses });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Courses / Programs</h2>
      <p className="text-gray-600 mb-6">Add courses or training programs offered by your institute</p>

      {/* Course List */}
      {!isAdding && (
        <div className="space-y-4 mb-6">
          {courses.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 mb-4">No courses added yet</p>
              <button
                onClick={handleAddCourse}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add First Course
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {courses.map((course, index) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{course.name}</h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          {course.mode && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">📍 {course.mode}</span>}
                          {course.level && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">📊 {course.level}</span>}
                          {course.duration && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">⏱️ {course.duration}</span>}
                          {course.totalFees && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">💰 ₹{course.totalFees}</span>}
                        </div>
                        {course.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditCourse(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(index)}
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
                onClick={handleAddCourse}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium inline-flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Course
              </button>
            </>
          )}
        </div>
      )}

      {/* Course Form */}
      {isAdding && (
        <div className="border border-gray-300 rounded-lg p-6 mb-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingIndex !== null ? 'Edit Course' : 'Add New Course'}
            </h3>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course / Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={currentCourse.name}
                onChange={handleChange}
                placeholder="E.g., NEET Foundation Course, Web Development Bootcamp"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Course Category, Level, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Category</label>
                <input
                  type="text"
                  name="category"
                  value={currentCourse.category}
                  onChange={handleChange}
                  placeholder="E.g., Medical, Technology"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  name="level"
                  value={currentCourse.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Level</option>
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={currentCourse.duration}
                  onChange={handleChange}
                  placeholder="E.g., 6 months, 1 year"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Course Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Mode <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {COURSE_MODES.map(mode => (
                  <label key={mode} className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={currentCourse.mode === mode}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{mode}</span>
                  </label>
                ))}
              </div>
              {errors.mode && <p className="text-red-500 text-sm mt-1">{errors.mode}</p>}
            </div>

            {/* Eligibility, Age Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility</label>
                <input
                  type="text"
                  name="eligibility"
                  value={currentCourse.eligibility}
                  onChange={handleChange}
                  placeholder="E.g., 12th Pass, Graduate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Age</label>
                <input
                  type="number"
                  name="minAge"
                  value={currentCourse.minAge}
                  onChange={handleChange}
                  placeholder="Min age"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Age</label>
                <input
                  type="number"
                  name="maxAge"
                  value={currentCourse.maxAge}
                  onChange={handleChange}
                  placeholder="Max age"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Fees and Seats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Fees (₹)</label>
                <input
                  type="number"
                  name="totalFees"
                  value={currentCourse.totalFees}
                  onChange={handleChange}
                  placeholder="E.g., 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
                <input
                  type="number"
                  name="seats"
                  value={currentCourse.seats}
                  onChange={handleChange}
                  placeholder="E.g., 50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
              <textarea
                name="description"
                value={currentCourse.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the course..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="certificationAvailable"
                  checked={currentCourse.certificationAvailable}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Certification Available</span>
              </label>

              {currentCourse.certificationAvailable && (
                <div className="ml-7">
                  <input
                    type="text"
                    name="certificateAuthority"
                    value={currentCourse.certificateAuthority}
                    onChange={handleChange}
                    placeholder="Certificate issuing authority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="trialAvailable"
                  checked={currentCourse.trialAvailable}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Trial / Demo Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="practicalTraining"
                  checked={currentCourse.practicalTraining}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Practical Training Included</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="entranceExamRequired"
                  checked={currentCourse.entranceExamRequired}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Entrance Exam Required</span>
              </label>

              {currentCourse.entranceExamRequired && (
                <div className="ml-7">
                  <input
                    type="text"
                    name="entranceExamName"
                    value={currentCourse.entranceExamName}
                    onChange={handleChange}
                    placeholder="Entrance exam name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Outcomes and Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Outcomes</label>
                <textarea
                  name="outcomes"
                  value={currentCourse.outcomes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What students will achieve..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills Learned</label>
                <textarea
                  name="skills"
                  value={currentCourse.skills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Skills students will gain..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                onClick={handleSaveCourse}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingIndex !== null ? 'Update Course' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isAdding && (
        <form onSubmit={handleSubmit}>
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
      )}
    </div>
  );
}
