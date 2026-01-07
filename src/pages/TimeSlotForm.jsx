import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { timeSlotAPI } from '../api/timeSlotAPI';

export default function TimeSlotForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    label: '',
    orderIndex: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTimeSlot();
    }
  }, [id]);

  const fetchTimeSlot = async () => {
    try {
      setLoading(true);
      const response = await timeSlotAPI.getById(id);
      const slot = response.data;
      setFormData({
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        label: slot.label || '',
        orderIndex: slot.orderIndex || ''
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startTime.trim()) {
      setError('Start time is required');
      return;
    }

    if (!formData.endTime.trim()) {
      setError('End time is required');
      return;
    }

    if (!formData.label.trim()) {
      setError('Label is required');
      return;
    }

    if (formData.orderIndex === '') {
      setError('Order index is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        label: formData.label,
        orderIndex: parseInt(formData.orderIndex)
      };

      if (id) {
        await timeSlotAPI.update(id, submitData);
        setSuccess('Time slot updated successfully');
      } else {
        await timeSlotAPI.create(submitData);
        setSuccess('Time slot created successfully');
      }

      setTimeout(() => {
        navigate('/timeslots');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {id ? 'Edit Time Slot' : 'Create Time Slot'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {loading && !success ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="startTime" className="block text-gray-700 font-bold mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="endTime" className="block text-gray-700 font-bold mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="label" className="block text-gray-700 font-bold mb-2">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="e.g., Slot 1, Morning Class"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="orderIndex" className="block text-gray-700 font-bold mb-2">
                  Order Index <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="orderIndex"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleChange}
                  placeholder="e.g., 1, 2, 3"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                >
                  {loading ? 'Saving...' : id ? 'Update Time Slot' : 'Create Time Slot'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/timeslots')}
                  disabled={loading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
