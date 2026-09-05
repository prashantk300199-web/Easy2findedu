import api from './api';

/**
 * Institute Draft Service
 * Handles institute registration draft operations
 */

// Get draft for logged-in owner
export const getDraft = async () => {
  try {
    const response = await api.get('/institute/draft');
    return response.data;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

// Save draft (manual or auto-save)
export const saveDraft = async (draftData) => {
  try {
    const response = await api.post('/institute/draft/save', draftData);
    return response.data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

// Get draft status
export const getDraftStatus = async () => {
  try {
    const response = await api.get('/institute/draft/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching draft status:', error);
    throw error;
  }
};

// Submit draft for verification
export const submitDraft = async () => {
  try {
    const response = await api.post('/institute/draft/submit');
    return response.data;
  } catch (error) {
    console.error('Error submitting draft:', error);
    throw error;
  }
};

// Delete draft
export const deleteDraft = async () => {
  try {
    const response = await api.delete('/institute/draft');
    return response.data;
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

// Upload file for draft
export const uploadDraftFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/institute/draft/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
