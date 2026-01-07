const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Batch API calls
export const batchAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/batches`);
    if (!response.ok) throw new Error('Failed to fetch batches');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}`);
    if (!response.ok) throw new Error('Failed to fetch batch');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create batch');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update batch');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete batch');
    return response.json();
  }
};
