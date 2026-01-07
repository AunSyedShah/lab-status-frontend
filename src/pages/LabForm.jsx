import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labAPI } from '../api/labAPI';

export default function LabForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    capacity: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (id) {
      fetchLab();
    }
  }, [id]);

  const fetchLab = async () => {
    try {
      setLoading(true);
      const response = await labAPI.getById(id);
      setFormData(response.data);
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

    if (!formData.code.trim()) {
      setError('Lab code is required');
      return;
    }

    if (!formData.capacity || formData.capacity < 1) {
      setError('Lab capacity must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        code: formData.code,
        capacity: parseInt(formData.capacity),
        location: formData.location
      };

      if (id) {
        await labAPI.update(id, submitData);
        setSuccess('Lab updated successfully');
      } else {
        await labAPI.create(submitData);
        setSuccess('Lab created successfully');
      }

      setTimeout(() => {
        navigate('/labs');
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
            {id ? 'Edit Lab' : 'Create Lab'}
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
                <label htmlFor="code" className="block text-gray-700 font-bold mb-2">
                  Lab Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., LAB001"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="capacity" className="block text-gray-700 font-bold mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Enter lab capacity"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="location" className="block text-gray-700 font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Building A, Room 101"
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
                  {loading ? 'Saving...' : id ? 'Update Lab' : 'Create Lab'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/labs')}
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
