import { fetchWithTimeout, TimeoutError, parseErrorResponse } from './fetchWithTimeout.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to handle API errors with proper parsing
async function handleResponse(response) {
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    const err = new Error(error.message);
    err.status = error.status;
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
  return response.json();
}

// Book API calls
export const bookAPI = {
  getAll: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/books`, {}, 10000);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/books/${id}`, {}, 10000);
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, 15000);
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, 15000);
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE'
    }, 15000);
    return handleResponse(response);
  }
};
