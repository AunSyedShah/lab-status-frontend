const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// TimeSlot API calls
export const timeSlotAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/timeslots`);
    if (!response.ok) throw new Error('Failed to fetch time slots');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/timeslots/${id}`);
    if (!response.ok) throw new Error('Failed to fetch time slot');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/timeslots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create time slot');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/timeslots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update time slot');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/timeslots/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete time slot');
    return response.json();
  }
};
