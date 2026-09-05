import api from './api';

/**
 * Category API Service
 * Handles fetching category configurations and dynamic fields
 */

// Get all categories with subcategories
export const getCategories = async () => {
  try {
    const response = await api.get('/institute/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get subcategories for a primary category
export const getSubcategories = async (primaryCategory) => {
  try {
    const response = await api.get('/institute/categories/subcategories', {
      params: { primaryCategory }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

// Get dynamic fields for a specific category/subcategory combination
export const getCategoryFields = async (primaryCategory, subcategory) => {
  try {
    const response = await api.get('/institute/categories/fields', {
      params: { primaryCategory, subcategory }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching category fields:', error);
    throw error;
  }
};
