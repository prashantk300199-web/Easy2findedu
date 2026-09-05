import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get draft
export const getDraft = async () => {
  const response = await api.get('/institute/draft');
  return response.data;
};

// Get draft status (for dashboard)
export const getDraftStatus = async () => {
  const response = await api.get('/institute/draft/status');
  return response.data;
};

// Save draft
export const saveDraft = async (draftData) => {
  const response = await api.post('/institute/draft/save', draftData);
  return response.data;
};

// Upload file for draft
export const uploadDraftFile = async (file, fieldName, stepNumber) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fieldName', fieldName);
  formData.append('stepNumber', stepNumber);

  const response = await api.post('/institute/draft/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Submit draft for verification
export const submitDraft = async () => {
  const response = await api.post('/institute/draft/submit');
  return response.data;
};

// Delete draft
export const deleteDraft = async () => {
  const response = await api.delete('/institute/draft');
  return response.data;
};

export default {
  getDraft,
  getDraftStatus,
  saveDraft,
  uploadDraftFile,
  submitDraft,
  deleteDraft
};
