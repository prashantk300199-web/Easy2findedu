import { API_BASE_URL } from '../lib/api';

/**
 * API client for institute draft operations
 * Handles authentication and HTTP requests
 */

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const api = {
  get: async (url: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  post: async (url: string, data?: any, config?: any) => {
    const token = getAuthToken();
    const headers: any = {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    // If custom headers are provided (like for file upload), use them
    if (config?.headers) {
      Object.assign(headers, config.headers);
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  put: async (url: string, data?: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  delete: async (url: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

export default api;
