const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Allocation API calls
export const allocationAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/allocations`);
    if (!response.ok) throw new Error('Failed to fetch allocations');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/allocations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch allocation');
    return response.json();
  },

  getByLab: async (labId) => {
    const response = await fetch(`${API_BASE_URL}/allocations/lab/${labId}`);
    if (!response.ok) throw new Error('Failed to fetch allocations for lab');
    return response.json();
  },

  getByBatch: async (batchId) => {
    const response = await fetch(`${API_BASE_URL}/allocations/batch/${batchId}`);
    if (!response.ok) throw new Error('Failed to fetch allocations for batch');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/allocations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create allocation');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/allocations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update allocation');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/allocations/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete allocation');
    return response.json();
  }
};
