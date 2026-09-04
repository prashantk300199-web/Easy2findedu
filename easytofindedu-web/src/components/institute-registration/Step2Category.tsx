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
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Category</h2>
      <p className="text-gray-600 mb-6">Select the category that best describes your institute</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Category <span className="text-red-500">*</span>
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
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{category.primary}</h3>
                </button>
              );
            })}
          </div>

          {errors.primaryCategory && (
            <p className="text-red-500 text-sm mt-2">{errors.primaryCategory}</p>
          )}
        </div>

        {/* Subcategory - Only show if primary is selected */}
        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory (Optional)
            </label>
            <select
              value={formData.subcategory}
              onChange={handleSubcategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Subcategory</option>
              {selectedCategory.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-sm mt-1">
              Help students find you more easily by selecting a specific subcategory
            </p>
          </div>
        )}

        {/* Examples Section */}
        {selectedCategory && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Examples for {selectedCategory.primary}:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedCategory.subcategories.slice(0, 4).map((sub) => (
                <li key={sub}>• {sub}</li>
              ))}
              {selectedCategory.subcategories.length > 4 && (
                <li>• And more...</li>
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
