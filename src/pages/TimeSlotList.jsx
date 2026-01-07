import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeSlotAPI } from '../api/timeSlotAPI';

export default function TimeSlotList() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await timeSlotAPI.getAll();
      setTimeSlots(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await timeSlotAPI.delete(id);
        setTimeSlots(timeSlots.filter(slot => slot._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Time Slots</h1>
          <button
            onClick={() => navigate('/timeslots/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Time Slot
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading time slots...</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No time slots found</p>
            <button
              onClick={() => navigate('/timeslots/create')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Create the first time slot
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {timeSlots.map((slot) => (
              <div
                key={slot._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {slot.label}
                </h2>
                <div className="text-gray-600 text-sm mb-4 space-y-2">
                  <p>
                    <span className="font-semibold">Start Time:</span> {slot.startTime}
                  </p>
                  <p>
                    <span className="font-semibold">End Time:</span> {slot.endTime}
                  </p>
                  <p>
                    <span className="font-semibold">Order Index:</span> {slot.orderIndex}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/timeslots/${slot._id}/edit`)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Created: {new Date(slot.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
