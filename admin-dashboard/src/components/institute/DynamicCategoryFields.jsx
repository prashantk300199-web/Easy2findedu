import React from 'react';
import { Info } from 'lucide-react';

/**
 * DynamicCategoryFields Component
 *
 * Renders category-specific fields based on configuration fetched from backend.
 * Supports multiple field types: text, number, select, multiselect, toggle.
 */
const DynamicCategoryFields = ({
  fields = [],
  values = {},
  onChange,
  errors = {}
}) => {

  const handleFieldChange = (fieldKey, value) => {
    if (onChange) {
      onChange(fieldKey, value);
    }
  };

  const renderField = (field) => {
    const value = values[field.key] || field.defaultValue || '';
    const error = errors[field.key];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              min="0"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      handleFieldChange(field.key, newValues);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'toggle':
        const toggleValue = typeof value === 'boolean' ? value : value === 'true';
        return (
          <div key={field.key} className="space-y-2">
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <button
                type="button"
                onClick={() => handleFieldChange(field.key, !toggleValue)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  toggleValue ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    toggleValue ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (!fields || fields.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">No additional fields required</p>
          <p className="text-sm text-blue-600 mt-1">
            The selected category doesn't have any additional configuration fields.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Category-Specific Information</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Please provide the following details specific to your selected category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(field => renderField(field))}
      </div>
    </div>
  );
};

export default DynamicCategoryFields;
