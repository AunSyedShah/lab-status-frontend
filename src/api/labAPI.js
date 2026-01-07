const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Lab API calls
export const labAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/labs`);
    if (!response.ok) throw new Error('Failed to fetch labs');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/labs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch lab');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/labs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create lab');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/labs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update lab');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/labs/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete lab');
    return response.json();
  }
};
