const API_BASE_URL = 'http://localhost:3000/api';

// Faculty API calls
export const facultyAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/faculties`);
    if (!response.ok) throw new Error('Failed to fetch faculties');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${id}`);
    if (!response.ok) throw new Error('Failed to fetch faculty');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/faculties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create faculty');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update faculty');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete faculty');
    return response.json();
  }
};
