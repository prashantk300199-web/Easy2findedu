import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  // Free-form category. Either a value from COURSE_CATEGORIES (when the
  // owner picks from the dropdown) or a custom string (when they pick
  // "Other" and type one). Stored as a string; never reduced to the
  // literal word "Other".
  category: string;
  // Helper field used to keep the dropdown's "Other" sentinel separate
  // from a custom string. Not persisted.
  categoryIsCustom?: boolean;
  level: string;
  duration: string;
  mode: string;
  eligibility: string;
  // Legacy single-fee shortcut (still supported on read). New edits
  // land in `fees.totalPayableAmount` instead.
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
  // Per-course fee structure. Different courses at the same institute
  // can have different fees; we therefore store the full breakdown on
  // each course. `feeIncludesGst` is a boolean (never inferred from
  // the amount).
  fees: {
    registrationFee: string;
    admissionFee: string;
    courseFee: string;
    monthlyFee: string;
    quarterlyFee: string;
    materialFee: string;
    kitFee: string;
    examFee: string;
    certificationFee: string;
    otherCharges: string;
    totalPayableAmount: string;
    feeIncludesGst: boolean;
  };
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

// Source-of-truth list of supported course categories. The order is
// meaningful: "Other" is always last so it's the obvious fallback.
const COURSE_CATEGORIES = [
  'Engineering',
  'Computer Science',
  'Information Technology',
  'Management',
  'Medical',
  'Dental',
  'Nursing',
  'Pharmacy',
  'Law',
  'Arts',
  'Science',
  'Commerce',
  'Education',
  'Agriculture',
  'Design',
  'Hotel Management',
  'Architecture',
  'Diploma',
  'Vocational',
  'Other'
];

const emptyCourse: Omit<Course, 'id'> = {
  name: '',
  category: '',
  categoryIsCustom: false,
  level: '',
  duration: '',
  mode: '',
  eligibility: '',
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
  entranceExamName: '',
  fees: {
    registrationFee: '',
    admissionFee: '',
    courseFee: '',
    monthlyFee: '',
    quarterlyFee: '',
    materialFee: '',
    kitFee: '',
    examFee: '',
    certificationFee: '',
    otherCharges: '',
    totalPayableAmount: '',
    feeIncludesGst: false
  }
};

// Normalize a previously-saved category value to one of:
//   - a value from COURSE_CATEGORIES (when it matches)
//   - a free-form custom string (when it doesn't match, including legacy
//     values the owner typed in directly)
//   - "" (when the course had no category)
const splitCategory = (raw: any): { value: string; isCustom: boolean } => {
  if (typeof raw !== 'string') return { value: '', isCustom: false };
  const trimmed = raw.trim();
  if (!trimmed) return { value: '', isCustom: false };
  if (COURSE_CATEGORIES.includes(trimmed) && trimmed !== 'Other') {
    return { value: trimmed, isCustom: false };
  }
  return { value: trimmed, isCustom: true };
};

// Normalize per-course fees from any of:
//   - the new `fees` sub-object (preferred)
//   - a flat row on the course itself (legacy / accidental flat fields)
//   - the institute-level `step9Fees` block (legacy — different courses
//     used to share the institute fee structure)
// Returns a fully populated `fees` object (defaulted) so the form
// always has a consistent shape to render.
const emptyFees = {
  registrationFee: '',
  admissionFee: '',
  courseFee: '',
  monthlyFee: '',
  quarterlyFee: '',
  materialFee: '',
  kitFee: '',
  examFee: '',
  certificationFee: '',
  otherCharges: '',
  totalPayableAmount: '',
  feeIncludesGst: false
};

const readFees = (c: any, fallbackInstituteFees?: any): typeof emptyFees => {
  const src = c?.fees;
  if (src && typeof src === 'object') {
    return {
      registrationFee: src.registrationFee ?? '',
      admissionFee: src.admissionFee ?? '',
      courseFee: src.courseFee ?? '',
      monthlyFee: src.monthlyFee ?? '',
      quarterlyFee: src.quarterlyFee ?? '',
      materialFee: src.materialFee ?? '',
      kitFee: src.kitFee ?? '',
      examFee: src.examFee ?? '',
      certificationFee: src.certificationFee ?? '',
      otherCharges: src.otherCharges ?? '',
      totalPayableAmount: src.totalPayableAmount ?? '',
      feeIncludesGst:
        typeof src.feeIncludesGst === 'boolean'
          ? src.feeIncludesGst
          : (typeof src.gstIncluded === 'boolean' ? src.gstIncluded : false)
    };
  }
  // Legacy fallback — the old step9Fees block had no per-course split
  // and applied the same fee structure to every course.
  if (fallbackInstituteFees && typeof fallbackInstituteFees === 'object') {
    return {
      registrationFee: fallbackInstituteFees.registrationFee ?? '',
      admissionFee: fallbackInstituteFees.admissionFee ?? '',
      courseFee: fallbackInstituteFees.courseFee ?? '',
      monthlyFee: fallbackInstituteFees.monthlyFee ?? '',
      quarterlyFee: fallbackInstituteFees.quarterlyFee ?? '',
      materialFee: fallbackInstituteFees.materialFee ?? '',
      kitFee: fallbackInstituteFees.kitFee ?? '',
      examFee: fallbackInstituteFees.examFee ?? '',
      certificationFee: fallbackInstituteFees.certificationFee ?? '',
      otherCharges: fallbackInstituteFees.otherCharges ?? '',
      totalPayableAmount: fallbackInstituteFees.totalPayableAmount ?? '',
      feeIncludesGst:
        typeof fallbackInstituteFees.feeIncludesGst === 'boolean'
          ? fallbackInstituteFees.feeIncludesGst
          : (typeof fallbackInstituteFees.gstIncluded === 'boolean' ? fallbackInstituteFees.gstIncluded : false)
    };
  }
  return { ...emptyFees };
};

export default function Step4Courses({ data, onNext, onBack, onSaveDraft, loading }: Step4Props) {
  // Legacy fallback path: older drafts that had a single institute-level
  // fee structure (data.step9Fees / data.fees / data.feesSection). When
  // the embedded `courses` array has no per-course fees, we seed each
  // course with that shared block so owners can still see the values
  // they previously entered.
  const instituteLevelFees =
    data?.step9Fees || data?.feesSection || data?.fees || null;

  const [courses, setCourses] = useState<Course[]>(
    Array.isArray(data?.courses)
      ? data.courses.map((c: any) => {
          const { value, isCustom } = splitCategory(c?.category);
          return {
            id: c?.id || Date.now().toString(),
            name: c?.name || c?.courseName || '',
            category: value,
            categoryIsCustom: isCustom,
            level: c?.level || '',
            duration: c?.duration || '',
            mode: c?.mode || '',
            eligibility: c?.eligibility || '',
            totalFees:
              c?.totalFees ||
              (c?.fees?.totalPayableAmount ? String(c.fees.totalPayableAmount) : ''),
            seats: c?.seats || '',
            description: c?.description || '',
            certificationAvailable: !!c?.certificationAvailable,
            certificateAuthority: c?.certificateAuthority || '',
            trialAvailable: !!c?.trialAvailable,
            practicalTraining: !!c?.practicalTraining,
            outcomes: c?.outcomes || '',
            skills: c?.skills || '',
            entranceExamRequired: !!c?.entranceExamRequired,
            entranceExamName: c?.entranceExamName || '',
            fees: readFees(c, instituteLevelFees)
          };
        })
      : []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Omit<Course, 'id'>>(emptyCourse);
  const [errors, setErrors] = useState<any>({});

  // Re-sync local state if the parent passes new draft data after initial mount.
  useEffect(() => {
    if (Array.isArray(data?.courses) && courses.length === 0) {
      setCourses(
        data.courses.map((c: any) => {
          const { value, isCustom } = splitCategory(c?.category);
          return {
            id: c?.id || Date.now().toString(),
            name: c?.name || c?.courseName || '',
            category: value,
            categoryIsCustom: isCustom,
            level: c?.level || '',
            duration: c?.duration || '',
            mode: c?.mode || '',
            eligibility: c?.eligibility || '',
            totalFees: c?.totalFees || '',
            seats: c?.seats || '',
            description: c?.description || '',
            certificationAvailable: !!c?.certificationAvailable,
            certificateAuthority: c?.certificateAuthority || '',
            trialAvailable: !!c?.trialAvailable,
            practicalTraining: !!c?.practicalTraining,
            outcomes: c?.outcomes || '',
            skills: c?.skills || '',
            entranceExamRequired: !!c?.entranceExamRequired,
            entranceExamName: c?.entranceExamName || '',
            fees: readFees(c, instituteLevelFees)
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  const handleCategorySelect = (value: string) => {
    // value is the option from the dropdown. When it's the "Other" sentinel
    // we keep the field empty so the owner can type a custom category.
    if (value === '__OTHER__') {
      setCurrentCourse(prev => ({ ...prev, category: '', categoryIsCustom: true }));
    } else {
      setCurrentCourse(prev => ({ ...prev, category: value, categoryIsCustom: false }));
    }
    if (errors.category) setErrors((prev: any) => ({ ...prev, category: '' }));
  };

  // Nested handler for the per-course fee fields. Field name format:
  //   `fees.<key>` so we can reuse one onChange across all fee inputs.
  // The GST radio uses `fees.feeIncludesGst` with value "yes" / "no".
  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentCourse(prev => {
      const next = { ...emptyFees, ...(prev.fees || {}) };
      if (name === 'fees.feeIncludesGst') {
        next.feeIncludesGst = value === 'yes' || checked === true;
      } else if (type === 'checkbox') {
        next.feeIncludesGst = !!checked;
      } else {
        const key = name.replace(/^fees\./, '');
        (next as any)[key] = value;
      }
      return { ...prev, fees: next };
    });
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: '' }));
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
      categoryIsCustom: course.categoryIsCustom,
      level: course.level,
      duration: course.duration,
      mode: course.mode,
      eligibility: course.eligibility,
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
      entranceExamName: course.entranceExamName,
      // Always seed from the saved course fees so editing a course
      // doesn't accidentally re-pull the institute-level legacy block.
      fees: { ...emptyFees, ...(course.fees || {}) }
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

  // Build a clean persistence shape so the server only ever sees the new
  // fields. Legacy fields (minAge / maxAge) are dropped silently; custom
  // categories are preserved as-is; per-course fees land on the
  // `fees` sub-object.
  const buildPersistableCourses = (list: Course[]) => list.map((c) => {
    const fees = { ...emptyFees, ...(c.fees || {}) };
    // Normalize the legacy single-fee shortcut: if the owner typed a
    // value in the old "Total Fees" field but didn't fill the new
    // breakdown, surface it on the breakdown so it's not silently
    // lost when we drop the shortcut.
    if (!fees.totalPayableAmount && c.totalFees) {
      fees.totalPayableAmount = c.totalFees;
    }
    return {
      id: c.id,
      courseName: c.name,
      name: c.name,
      category: (c.category || '').trim(),
      level: c.level,
      duration: c.duration,
      mode: c.mode,
      eligibility: c.eligibility,
      // Keep `totalFees` on the top level for legacy readers; the new
      // canonical copy lives on `fees.totalPayableAmount`.
      totalFees: fees.totalPayableAmount || c.totalFees,
      seats: c.seats,
      description: c.description,
      certificationAvailable: c.certificationAvailable,
      certificateAuthority: c.certificateAuthority,
      trialAvailable: c.trialAvailable,
      practicalTraining: c.practicalTraining,
      outcomes: c.outcomes,
      skills: c.skills,
      entranceExamRequired: c.entranceExamRequired,
      entranceExamName: c.entranceExamName,
      fees
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ courses: buildPersistableCourses(courses) });
  };

  const handleSave = () => {
    onSaveDraft({ courses: buildPersistableCourses(courses) });
  };

  // Whether the dropdown should currently show "Other" as selected.
  // True when (a) the category is not in the predefined list, or (b) it's
  // a custom string. This keeps the dropdown's "Other" sentinel visible
  // after a custom value has been entered.
  const dropdownValue = useMemo(() => {
    if (currentCourse.categoryIsCustom) return '__OTHER__';
    if (currentCourse.category && COURSE_CATEGORIES.includes(currentCourse.category) && currentCourse.category !== 'Other') {
      return currentCourse.category;
    }
    if (currentCourse.category === 'Other') return '__OTHER__';
    return '';
  }, [currentCourse.category, currentCourse.categoryIsCustom]);

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Courses / Programs</h2>
      <p className="text-cream-100/60 mb-8">Add courses or training programs offered by your institute</p>

      {/* Course List */}
      {!isAdding && (
        <div className="space-y-4 mb-6">
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-night-900/50 rounded-lg border-2 border-dashed border-night-700">
              <BookOpen className="mx-auto h-12 w-12 text-gold-400 mb-3" />
              <p className="text-cream-100/60 mb-4">No courses added yet</p>
              <button
                onClick={handleAddCourse}
                className="px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 inline-flex items-center gap-2 font-bold shadow-goldGlow transition-all"
              >
                <Plus size={18} />
                Add First Course
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {courses.map((course, index) => (
                  <div key={course.id} className="border border-night-700 bg-night-900 rounded-lg p-5 hover:shadow-goldGlow hover:border-gold-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-cream-100">{course.name}</h3>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {course.category && (
                            <span className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded border border-blue-500/30">
                              📂 {course.category}
                            </span>
                          )}
                          {course.mode && <span className="bg-gold-900/30 text-gold-400 px-3 py-1.5 rounded border border-gold-500/30">📍 {course.mode}</span>}
                          {course.level && <span className="bg-purple-900/30 text-purple-400 px-3 py-1.5 rounded border border-purple-500/30">📊 {course.level}</span>}
                          {course.duration && <span className="bg-green-900/30 text-green-400 px-3 py-1.5 rounded border border-green-500/30">⏱️ {course.duration}</span>}
                          {course.fees?.totalPayableAmount && (
                            <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1.5 rounded border border-yellow-500/30">
                              💰 ₹{course.fees.totalPayableAmount}
                              {course.fees.feeIncludesGst && <span className="text-[10px] ml-1 opacity-80">(incl. GST)</span>}
                            </span>
                          )}
                          {!course.fees?.totalPayableAmount && course.totalFees && (
                            <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1.5 rounded border border-yellow-500/30">💰 ₹{course.totalFees}</span>
                          )}
                        </div>
                        {course.description && (
                          <p className="mt-3 text-sm text-cream-100/60 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditCourse(index)}
                          className="p-2 text-gold-400 hover:bg-night-700 rounded transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(index)}
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
                onClick={handleAddCourse}
                className="w-full py-4 border-2 border-dashed border-night-700 rounded-lg hover:border-gold-500 hover:bg-night-900/50 text-cream-100 hover:text-gold-400 font-semibold inline-flex items-center justify-center gap-2 transition-all"
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
        <div className="border border-gold-500/30 rounded-lg p-6 mb-6 bg-night-900/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-cream-100">
              {editingIndex !== null ? 'Edit Course' : 'Add New Course'}
            </h3>
            <button onClick={handleCancel} className="text-cream-100/60 hover:text-cream-100">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Course / Program Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={currentCourse.name}
                onChange={handleChange}
                placeholder="E.g., NEET Foundation Course, Web Development Bootcamp"
                className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                  errors.name ? 'border-red-500' : 'border-night-700'
                }`}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Course Category, Level, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">Course Category</label>
                <select
                  value={dropdownValue}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
                >
                  <option value="">Select a category</option>
                  {COURSE_CATEGORIES.filter(c => c !== 'Other').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__OTHER__">Other (add custom)…</option>
                </select>
                {currentCourse.categoryIsCustom && (
                  <input
                    type="text"
                    value={currentCourse.category}
                    onChange={(e) => setCurrentCourse(prev => ({ ...prev, category: e.target.value, categoryIsCustom: true }))}
                    placeholder="Enter custom category"
                    className="mt-2 w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                )}
                <p className="text-xs text-cream-100/40 mt-1">
                  Pick a standard category or "Other" to add your own.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">Level</label>
                <select
                  name="level"
                  value={currentCourse.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 transition-all"
                >
                  <option value="">Select Level</option>
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={currentCourse.duration}
                  onChange={handleChange}
                  placeholder="E.g., 6 months, 1 year"
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                />
              </div>
            </div>

            {/* Course Mode */}
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Course Mode <span className="text-red-400">*</span>
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
                      className="mr-2 accent-gold-500"
                    />
                    <span className="text-sm text-cream-100">{mode}</span>
                  </label>
                ))}
              </div>
              {errors.mode && <p className="text-red-400 text-sm mt-1">{errors.mode}</p>}
            </div>

            {/* Eligibility (age fields removed) */}
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">Eligibility</label>
              <input
                type="text"
                name="eligibility"
                value={currentCourse.eligibility}
                onChange={handleChange}
                placeholder="E.g., 12th Pass, Graduate"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            {/* Seats (Total Fees moved into the per-course fees block below) */}
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">Number of Seats</label>
              <input
                type="text"
                name="seats"
                value={currentCourse.seats}
                onChange={handleChange}
                placeholder="E.g., 50"
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            {/* Per-course Fee Structure + GST */}
            <div className="bg-night-900/50 border border-night-700 rounded-lg p-5 space-y-4">
              <div>
                <h4 className="text-base font-semibold text-cream-100">
                  Fee Structure (this course)
                </h4>
                <p className="text-xs text-cream-100/50 mt-1">
                  Each course can have its own fee structure. Fill only the fee types that
                  apply to this course. The total below is what students will see on the
                  course listing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  ['registrationFee', 'Registration Fee (₹)'],
                  ['admissionFee', 'Admission Fee (₹)'],
                  ['courseFee', 'Course Fee (₹)'],
                  ['monthlyFee', 'Monthly Fee (₹)'],
                  ['quarterlyFee', 'Quarterly Fee (₹)'],
                  ['materialFee', 'Material Fee (₹)'],
                  ['kitFee', 'Kit Fee (₹)'],
                  ['examFee', 'Exam Fee (₹)'],
                  ['certificationFee', 'Certification Fee (₹)'],
                  ['otherCharges', 'Other Charges (₹)']
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-cream-100 mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      name={`fees.${key}`}
                      value={currentCourse.fees?.[key as keyof typeof currentCourse.fees] as string ?? ''}
                      onChange={handleFeeChange}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-night-900 border border-night-700 rounded-lg text-sm text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-cream-100 mb-1">
                    Total Payable (₹)
                  </label>
                  <input
                    type="text"
                    name="fees.totalPayableAmount"
                    value={currentCourse.fees?.totalPayableAmount ?? ''}
                    onChange={handleFeeChange}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-night-900 border border-gold-500/40 rounded-lg text-sm text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                  <p className="text-[10px] text-cream-100/40 mt-1">
                    This is the headline fee students will see.
                  </p>
                </div>
              </div>

              {/* GST inclusion — stored as a boolean on the course, never
                  inferred from the amount. */}
              <div className="border-t border-night-700 pt-4">
                <p className="text-sm font-semibold text-cream-100 mb-2">
                  Does the fee for this course include GST?
                </p>
                <p className="text-xs text-cream-100/50 mb-3">
                  The amount entered above is stored as-is — no GST is added or removed.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label
                    className={`flex-1 flex items-start gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-all ${
                      currentCourse.fees?.feeIncludesGst === true
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-night-700 bg-night-900 hover:border-gold-500/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fees.feeIncludesGst"
                      value="yes"
                      checked={currentCourse.fees?.feeIncludesGst === true}
                      onChange={handleFeeChange}
                      className="mt-0.5 accent-gold-500"
                    />
                    <span>
                      <span className="block text-cream-100 font-semibold">Yes — GST included</span>
                      <span className="block text-cream-100/50 text-xs mt-0.5">
                        The amount above already includes GST.
                      </span>
                    </span>
                  </label>
                  <label
                    className={`flex-1 flex items-start gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-all ${
                      currentCourse.fees?.feeIncludesGst === false
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-night-700 bg-night-900 hover:border-gold-500/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fees.feeIncludesGst"
                      value="no"
                      checked={currentCourse.fees?.feeIncludesGst === false}
                      onChange={handleFeeChange}
                      className="mt-0.5 accent-gold-500"
                    />
                    <span>
                      <span className="block text-cream-100 font-semibold">No — GST not included</span>
                      <span className="block text-cream-100/50 text-xs mt-0.5">
                        GST is charged extra on top of the amount above.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">Course Description</label>
              <textarea
                name="description"
                value={currentCourse.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the course..."
                className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 bg-night-900/50 p-5 rounded-lg border border-night-700">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="certificationAvailable"
                  checked={currentCourse.certificationAvailable}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 accent-gold-500"
                />
                <span className="text-sm text-cream-100">Certification Available</span>
              </label>

              {currentCourse.certificationAvailable && (
                <div className="ml-7">
                  <input
                    type="text"
                    name="certificateAuthority"
                    value={currentCourse.certificateAuthority}
                    onChange={handleChange}
                    placeholder="Certificate issuing authority"
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>
              )}

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="trialAvailable"
                  checked={currentCourse.trialAvailable}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 accent-gold-500"
                />
                <span className="text-sm text-cream-100">Trial / Demo Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="practicalTraining"
                  checked={currentCourse.practicalTraining}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 accent-gold-500"
                />
                <span className="text-sm text-cream-100">Practical Training Included</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="entranceExamRequired"
                  checked={currentCourse.entranceExamRequired}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 accent-gold-500"
                />
                <span className="text-sm text-cream-100">Entrance Exam Required</span>
              </label>

              {currentCourse.entranceExamRequired && (
                <div className="ml-7">
                  <input
                    type="text"
                    name="entranceExamName"
                    value={currentCourse.entranceExamName}
                    onChange={handleChange}
                    placeholder="Entrance exam name"
                    className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Outcomes and Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">Course Outcomes</label>
                <textarea
                  name="outcomes"
                  value={currentCourse.outcomes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What students will achieve..."
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">Skills Learned</label>
                <textarea
                  name="skills"
                  value={currentCourse.skills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Skills students will gain..."
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 transition-all"
                />
              </div>
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
                onClick={handleSaveCourse}
                className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 transition-all font-bold shadow-goldGlow"
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
        </form>
      )}
    </div>
  );
}
