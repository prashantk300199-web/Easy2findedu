import api from './api';

// Path only — api.post/api.get/etc. prepend the API base. Using a full URL
// here would double up "https://...onrender.com/api/v1" on the path.
const ENDPOINT = '/college-draft';

/**
 * College draft service — 1:1 mirror of instituteDraft.service.js
 * but pointed at the new /college-draft/* routes.
 */

export const getDraft = async () => {
  try {
    const response = await api.get(`${ENDPOINT}/draft`);
    return response;
  } catch (error) {
    console.error('Error fetching college draft:', error);
    throw error;
  }
};

export const saveDraft = async (draftData) => {
  try {
    const response = await api.post(`${ENDPOINT}/draft/save`, draftData);
    return response;
  } catch (error) {
    console.error('Error saving college draft:', error);
    throw error;
  }
};

export const getDraftStatus = async () => {
  try {
    const response = await api.get(`${ENDPOINT}/draft/status`);
    return response;
  } catch (error) {
    console.error('Error fetching college draft status:', error);
    throw error;
  }
};

export const submitDraft = async () => {
  try {
    const response = await api.post(`${ENDPOINT}/draft/submit`);
    return response;
  } catch (error) {
    console.error('Error submitting college draft:', error);
    throw error;
  }
};

export const deleteDraft = async () => {
  try {
    const response = await api.delete(`${ENDPOINT}/draft`);
    return response;
  } catch (error) {
    console.error('Error deleting college draft:', error);
    throw error;
  }
};

/**
 * Upload a file for a college draft step. Returns the Cloudinary URL.
 * Pass `append: true` for array fields like step10 gallery.
 */
export const uploadCollegeDraftFile = async (file, { stepNumber, fieldName, append = false, arrayField }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stepNumber', String(stepNumber));
    formData.append('fieldName', fieldName);
    if (append) {
      formData.append('append', 'true');
      if (arrayField) formData.append('arrayField', arrayField);
    }
    const response = await api.post(`${ENDPOINT}/draft/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  } catch (error) {
    console.error('Error uploading college draft file:', error);
    throw error;
  }
};