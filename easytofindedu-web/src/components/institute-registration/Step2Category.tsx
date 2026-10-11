import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Code, Palette, Sparkles, Languages, TrendingUp, Wrench, MoreHorizontal, Check, X } from 'lucide-react';

interface Step2Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

// Single source of truth for category → subcategories.
// Each top-level category is a domain. Subcategories are the specific
// examinations / programs that an institute in that domain can target.
// `Other` is always appended so users can still pick a custom option
// when their actual target is not in the predefined list.
const CATEGORIES = [
  {
    primary: 'Medical Coaching',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    subcategories: [
      'NEET UG',
      'NEET PG',
      'INI-CET',
      'AIIMS',
      'JIPMER',
      'Nursing Entrance Exams',
      'Paramedical Entrance Exams',
      'State-level Medical Entrance Exams',
      'Other'
    ]
  },
  {
    primary: 'Engineering Coaching',
    icon: Code,
    color: 'bg-purple-100 text-purple-600',
    subcategories: [
      'JEE Main',
      'JEE Advanced',
      'GATE',
      'State Engineering Entrance Exams',
      'BITSAT',
      'VITEEE',
      'MHT-CET',
      'WBJEE',
      'Other'
    ]
  },
  {
    primary: 'Management Coaching',
    icon: TrendingUp,
    color: 'bg-yellow-100 text-yellow-600',
    subcategories: [
      'CAT',
      'XAT',
      'MAT',
      'CMAT',
      'SNAP',
      'NMAT',
      'ATMA',
      'IIFT',
      'Other'
    ]
  },
  {
    primary: 'Government Exam Preparation',
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-600',
    subcategories: [
      'UPSC CSE',
      'BPSC',
      'SSC CGL',
      'SSC CHSL',
      'Banking Exams',
      'Railway Exams',
      'NDA',
      'CDS',
      'State PSC Exams',
      'Teaching Exams (TET / KVS / NVS)',
      'Defence Exams',
      'Other'
    ]
  },
  {
    primary: 'Research / Academic',
    icon: BookOpen,
    color: 'bg-cyan-100 text-cyan-600',
    subcategories: [
      'UGC NET',
      'CSIR NET',
      'GATE (Research)',
      'IIT JAM',
      'PhD Entrance Exams',
      'Other'
    ]
  },
  {
    primary: 'Law Coaching',
    icon: BookOpen,
    color: 'bg-indigo-100 text-indigo-600',
    subcategories: [
      'CLAT',
      'AILET',
      'State Law Entrance Exams',
      'Judiciary Exams',
      'Other'
    ]
  },
  {
    primary: 'School & K-12 Tuition',
    icon: BookOpen,
    color: 'bg-pink-100 text-pink-600',
    subcategories: [
      'School Tuition (Class 1-12)',
      'Board Exam Preparation',
      'Olympiad Preparation',
      'Foundation Courses',
      'Other'
    ]
  },
  {
    primary: 'Professional & Technology',
    icon: Code,
    color: 'bg-violet-100 text-violet-600',
    subcategories: [
      'Coding & Programming',
      'Web Development',
      'Mobile App Development',
      'Data Science & AI',
      'Cyber Security',
      'Cloud Computing',
      'Digital Marketing',
      'Other'
    ]
  },
  {
    primary: 'Arts & Creative',
    icon: Palette,
    color: 'bg-rose-100 text-rose-600',
    subcategories: [
      'Dance (Classical, Contemporary, Hip-hop)',
      'Music (Vocal, Instrumental)',
      'Fine Arts & Painting',
      'Photography',
      'Film Making',
      'Graphic Design',
      'Animation',
      'Other'
    ]
  },
  {
    primary: 'Beauty & Fashion',
    icon: Sparkles,
    color: 'bg-fuchsia-100 text-fuchsia-600',
    subcategories: [
      'Makeup Artistry',
      'Hair Styling',
      'Skin Care',
      'Fashion Design',
      'Beauty Therapy',
      'Nail Art',
      'Bridal Makeup',
      'Other'
    ]
  },
  {
    primary: 'Languages',
    icon: Languages,
    color: 'bg-green-100 text-green-600',
    subcategories: [
      'Spoken English',
      'IELTS Preparation',
      'TOEFL Preparation',
      'French',
      'Spanish',
      'German',
      'Japanese',
      'Other'
    ]
  },
  {
    primary: 'Finance',
    icon: TrendingUp,
    color: 'bg-amber-100 text-amber-600',
    subcategories: [
      'Stock Market Trading',
      'Investment & Portfolio Management',
      'Cryptocurrency',
      'Financial Planning',
      'Accounting',
      'Banking & Insurance',
      'Taxation',
      'Other'
    ]
  },
  {
    primary: 'Vocational & Skill Development',
    icon: Wrench,
    color: 'bg-orange-100 text-orange-600',
    subcategories: [
      'Computer Hardware',
      'Electrical & Electronics',
      'Plumbing',
      'Carpentry',
      'Tailoring & Stitching',
      'Automobile Repair',
      'Welding',
      'Other'
    ]
  },
  {
    primary: 'Other',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-600',
    subcategories: [
      'Yoga & Fitness',
      'Cooking & Baking',
      'Personality Development',
      'Soft Skills',
      'Public Speaking',
      'Event Management',
      'Interior Design',
      'Other'
    ]
  }
];

// Legacy → new: older drafts may have written a single `subcategory` string
// instead of the new `subcategories` array. Normalize at the boundary so
// the rest of the app can rely on array shape.
const readInitialSubcategories = (data: any): string[] => {
  if (Array.isArray(data?.subcategories)) return data.subcategories.filter(Boolean);
  if (typeof data?.subcategory === 'string' && data.subcategory.trim()) return [data.subcategory];
  if (Array.isArray(data?.category?.subcategories)) return data.category.subcategories.filter(Boolean);
  if (typeof data?.category?.subcategory === 'string' && data.category.subcategory.trim()) return [data.category.subcategory];
  return [];
};

const readInitialPrimary = (data: any): string => {
  return data?.primaryCategory || data?.category?.primary || '';
};

export default function Step2Category({ data, onNext, onBack, onSaveDraft, loading }: Step2Props) {
  const [primaryCategory, setPrimaryCategory] = useState<string>(readInitialPrimary(data));
  const [selectedSubs, setSelectedSubs] = useState<string[]>(readInitialSubcategories(data));
  const [customSubInput, setCustomSubInput] = useState('');
  const [errors, setErrors] = useState<any>({});

  // Re-sync local state if the parent passes new draft data (e.g. on initial load).
  useEffect(() => {
    setPrimaryCategory(readInitialPrimary(data));
    setSelectedSubs(readInitialSubcategories(data));
  }, [data]);

  const selectedCategory = useMemo(
    () => CATEGORIES.find(cat => cat.primary === primaryCategory),
    [primaryCategory]
  );

  const handleCategorySelect = (primary: string) => {
    setPrimaryCategory(primary);
    // Reset subcategories when the parent category changes — subcategories
    // are domain-specific and a previous selection in a different domain
    // is no longer meaningful.
    setSelectedSubs([]);
    setCustomSubInput('');
    if (errors.primaryCategory) setErrors((prev: any) => ({ ...prev, primaryCategory: '' }));
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedSubs(prev => {
      if (prev.includes(sub)) return prev.filter(s => s !== sub);
      if (prev.length >= 50) return prev; // sanity cap
      return [...prev, sub];
    });
  };

  const handleAddCustomSub = () => {
    const trimmed = customSubInput.trim();
    if (!trimmed) return;
    if (selectedSubs.includes(trimmed)) {
      setCustomSubInput('');
      return;
    }
    setSelectedSubs(prev => [...prev, trimmed]);
    setCustomSubInput('');
  };

  const handleRemoveSub = (sub: string) => {
    setSelectedSubs(prev => prev.filter(s => s !== sub));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!primaryCategory) newErrors.primaryCategory = 'Please select a primary category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const persist = () => ({
    primaryCategory,
    subcategories: selectedSubs
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext(persist());
  };

  const handleSave = () => {
    if (validate()) onSaveDraft(persist());
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Category</h2>
      <p className="text-cream-100/60 mb-8">
        Select the category that best describes your institute. You can pick multiple target examinations / programs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Category */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-4">
            Primary Category <span className="text-red-400">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = primaryCategory === category.primary;

              return (
                <button
                  key={category.primary}
                  type="button"
                  onClick={() => handleCategorySelect(category.primary)}
                  className={`p-5 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-gold-500 bg-gold-900/20 shadow-goldGlow'
                      : 'border-night-700 bg-night-900 hover:border-gold-500/30 hover:bg-night-850'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gold-500/20 flex items-center justify-center mb-3">
                    <Icon size={24} className="text-gold-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-cream-100">{category.primary}</h3>
                </button>
              );
            })}
          </div>

          {errors.primaryCategory && (
            <p className="text-red-400 text-sm mt-2">{errors.primaryCategory}</p>
          )}
        </div>

        {/* Subcategory — multi-select, category-dependent */}
        {selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-cream-100">
                Target Examinations / Programs (optional, select any that apply)
              </label>
              {selectedSubs.length > 0 && (
                <span className="text-xs text-gold-400">
                  {selectedSubs.length} selected
                </span>
              )}
            </div>

            {/* Selected chips */}
            {selectedSubs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg bg-night-900/60 border border-night-700">
                {selectedSubs.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 bg-gold-500/20 text-gold-300 border border-gold-500/40 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSub(sub)}
                      className="text-gold-300 hover:text-cream-100 transition-colors"
                      aria-label={`Remove ${sub}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefined options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {selectedCategory.subcategories.map((sub) => {
                const isChecked = selectedSubs.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubcategory(sub)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                      isChecked
                        ? 'bg-gold-500/20 border-gold-500 text-gold-200'
                        : 'bg-night-900 border-night-700 text-cream-100 hover:border-gold-500/40'
                    }`}
                  >
                    <span>{sub}</span>
                    {isChecked && <Check size={14} className="text-gold-300 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom subcategory input */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={customSubInput}
                onChange={(e) => setCustomSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSub();
                  }
                }}
                placeholder="Add a custom examination / program"
                className="flex-1 px-3 py-2 bg-night-900 border border-night-700 rounded-lg text-sm text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddCustomSub}
                disabled={!customSubInput.trim()}
                className="px-4 py-2 bg-gold-500 text-night-900 rounded-lg text-sm font-semibold hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add
              </button>
            </div>

            <p className="text-cream-100/50 text-sm mt-3">
              Select every target examination / program your institute prepares students for.
              You can also add a custom target if it's not in the list.
            </p>
          </div>
        )}

        {/* Examples Section */}
        {selectedCategory && (
          <div className="bg-night-900/50 border border-gold-500/20 rounded-lg p-5">
            <h4 className="font-semibold text-gold-400 mb-3">Examples for {selectedCategory.primary}:</h4>
            <ul className="text-sm text-cream-100/70 space-y-1.5">
              {selectedCategory.subcategories.slice(0, 4).map((sub) => (
                <li key={sub}>• {sub}</li>
              ))}
              {selectedCategory.subcategories.length > 4 && (
                <li className="text-cream-100/50">• And more...</li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
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
    </div>
  );
}
