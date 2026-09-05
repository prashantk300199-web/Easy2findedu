import { useState } from 'react';
import { BookOpen, Code, Palette, Sparkles, Languages, TrendingUp, Wrench, MoreHorizontal } from 'lucide-react';

interface Step2Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const CATEGORIES = [
  {
    primary: 'Education & Academic',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    subcategories: [
      'NEET Coaching',
      'JEE Coaching',
      'UPSC Preparation',
      'School Tuition (Class 1-12)',
      'Competitive Exams',
      'Board Exam Preparation',
      'Entrance Test Coaching',
      'Other'
    ]
  },
  {
    primary: 'Professional & Technology',
    icon: Code,
    color: 'bg-purple-100 text-purple-600',
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
    color: 'bg-pink-100 text-pink-600',
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
    color: 'bg-rose-100 text-rose-600',
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
    color: 'bg-yellow-100 text-yellow-600',
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

export default function Step2Category({ data, onNext, onBack, onSaveDraft, loading }: Step2Props) {
  const [formData, setFormData] = useState({
    primaryCategory: data?.category?.primary || '',
    subcategory: data?.category?.subcategory || ''
  });

  const [errors, setErrors] = useState<any>({});

  const selectedCategory = CATEGORIES.find(cat => cat.primary === formData.primaryCategory);

  const handleCategorySelect = (primary: string) => {
    setFormData({
      primaryCategory: primary,
      subcategory: '' // Reset subcategory when primary changes
    });
    if (errors.primaryCategory) {
      setErrors((prev: any) => ({ ...prev, primaryCategory: '' }));
    }
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      subcategory: e.target.value
    }));
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.primaryCategory) {
      newErrors.primaryCategory = 'Please select a primary category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        category: {
          primary: formData.primaryCategory,
          subcategory: formData.subcategory
        }
      });
    }
  };

  const handleSave = () => {
    onSaveDraft({
      category: {
        primary: formData.primaryCategory,
        subcategory: formData.subcategory
      }
    });
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Category</h2>
      <p className="text-cream-100/60 mb-8">Select the category that best describes your institute</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Category */}
        <div>
          <label className="block text-sm font-semibold text-cream-100 mb-4">
            Primary Category <span className="text-red-400">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = formData.primaryCategory === category.primary;

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
                  <div className={`w-12 h-12 rounded-lg bg-gold-500/20 flex items-center justify-center mb-3`}>
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

        {/* Subcategory - Only show if primary is selected */}
        {selectedCategory && (
          <div>
            <label className="block text-sm font-semibold text-cream-100 mb-2">
              Subcategory (Optional)
            </label>
            <select
              value={formData.subcategory}
              onChange={handleSubcategoryChange}
              className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
            >
              <option value="">Select Subcategory</option>
              {selectedCategory.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <p className="text-cream-100/50 text-sm mt-2">
              Help students find you more easily by selecting a specific subcategory
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
