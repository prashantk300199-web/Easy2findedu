import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, Info } from 'lucide-react';
import DynamicCategoryFields from './DynamicCategoryFields';
import { getCategories, getCategoryFields } from '../../services/categoryService';

/**
 * Step 2: Category Selection with Dynamic Fields
 *
 * Allows institute owners to:
 * 1. Select primary category
 * 2. Select one or more subcategories
 * 3. Fill category-specific dynamic fields for each subcategory
 */
const Step2Category = ({ data, onChange, onNext, onPrev }) => {
  const [categories, setCategories] = useState([]);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState(data?.primaryCategory || '');
  const [selectedSubcategories, setSelectedSubcategories] = useState(data?.subcategories || []);
  const [categorySpecificData, setCategorySpecificData] = useState(data?.categorySpecificData || {});
  const [dynamicFields, setDynamicFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load dynamic fields when subcategories change
  useEffect(() => {
    if (selectedPrimaryCategory && selectedSubcategories.length > 0) {
      loadDynamicFields();
    } else {
      setDynamicFields({});
    }
  }, [selectedPrimaryCategory, selectedSubcategories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadDynamicFields = async () => {
    try {
      const fieldsMap = {};

      // Load fields for each selected subcategory
      for (const subcategory of selectedSubcategories) {
        const response = await getCategoryFields(selectedPrimaryCategory, subcategory);
        if (response.data?.fields) {
          fieldsMap[subcategory] = response.data.fields;
        }
      }

      setDynamicFields(fieldsMap);
    } catch (err) {
      console.error('Error loading dynamic fields:', err);
      setError('Failed to load category-specific fields.');
    }
  };

  const handlePrimaryCategoryChange = (categoryValue) => {
    setSelectedPrimaryCategory(categoryValue);
    setSelectedSubcategories([]);
    setCategorySpecificData({});
    setDynamicFields({});
    setFieldErrors({});
  };

  const handleSubcategoryToggle = (subcategoryValue) => {
    const newSubcategories = selectedSubcategories.includes(subcategoryValue)
      ? selectedSubcategories.filter(s => s !== subcategoryValue)
      : [...selectedSubcategories, subcategoryValue];

    setSelectedSubcategories(newSubcategories);

    // Remove data for unselected subcategories
    if (!newSubcategories.includes(subcategoryValue)) {
      const newData = { ...categorySpecificData };
      delete newData[subcategoryValue];
      setCategorySpecificData(newData);
    }
  };

  const handleDynamicFieldChange = (subcategory, fieldKey, value) => {
    setCategorySpecificData(prev => ({
      ...prev,
      [subcategory]: {
        ...(prev[subcategory] || {}),
        [fieldKey]: value
      }
    }));

    // Clear error for this field
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[subcategory]) {
        delete newErrors[subcategory][fieldKey];
      }
      return newErrors;
    });
  };

  const validateFields = () => {
    const errors = {};
    let hasErrors = false;

    // Check primary category
    if (!selectedPrimaryCategory) {
      setError('Please select a primary category');
      return false;
    }

    // Check subcategories
    if (selectedSubcategories.length === 0) {
      setError('Please select at least one subcategory');
      return false;
    }

    // Validate dynamic fields for each subcategory
    selectedSubcategories.forEach(subcategory => {
      const fields = dynamicFields[subcategory] || [];
      const values = categorySpecificData[subcategory] || {};
      const subcategoryErrors = {};

      fields.forEach(field => {
        if (field.required) {
          const value = values[field.key];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            subcategoryErrors[field.key] = `${field.label} is required`;
            hasErrors = true;
          }
        }
      });

      if (Object.keys(subcategoryErrors).length > 0) {
        errors[subcategory] = subcategoryErrors;
      }
    });

    setFieldErrors(errors);

    if (hasErrors) {
      setError('Please fill all required fields');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateFields()) {
      return;
    }

    // Pass data to parent
    onChange({
      primaryCategory: selectedPrimaryCategory,
      subcategories: selectedSubcategories,
      categorySpecificData
    });

    onNext();
  };

  const getAvailableSubcategories = () => {
    const category = categories.find(c => c.value === selectedPrimaryCategory);
    return category?.subcategories || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Selection</h2>
        <p className="text-gray-600">
          Select your primary category and subcategories. You'll provide specific details for each subcategory.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Validation Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Primary Category Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Primary Category <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedPrimaryCategory}
          onChange={(e) => handlePrimaryCategoryChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select Primary Category</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories Selection */}
      {selectedPrimaryCategory && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Subcategories <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal ml-2">(Select all that apply)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getAvailableSubcategories().map(subcategory => (
              <label
                key={subcategory.value}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSubcategories.includes(subcategory.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSubcategories.includes(subcategory.value)}
                  onChange={() => handleSubcategoryToggle(subcategory.value)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">{subcategory.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Fields for Each Subcategory */}
      {selectedSubcategories.length > 0 && (
        <div className="space-y-8">
          {selectedSubcategories.map(subcategory => {
            const subcategoryLabel = getAvailableSubcategories().find(s => s.value === subcategory)?.label;
            const fields = dynamicFields[subcategory] || [];
            const values = categorySpecificData[subcategory] || {};
            const errors = fieldErrors[subcategory] || {};

            return (
              <div key={subcategory} className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ChevronDown className="w-5 h-5 mr-2 text-blue-600" />
                  {subcategoryLabel}
                </h3>

                <DynamicCategoryFields
                  fields={fields}
                  values={values}
                  errors={errors}
                  onChange={(fieldKey, value) => handleDynamicFieldChange(subcategory, fieldKey, value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default Step2Category;
