import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyAPI } from '../api/facultyAPI';
import { useReferenceData } from '../context/useReferenceData';

export default function FacultyList() {
  const { faculties, refreshFaculties } = useReferenceData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        await facultyAPI.delete(id);
        // Refresh context data to reflect deletion
        await refreshFaculties();
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to delete faculty');
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshFaculties();
      setError(null);
    } catch {
      setError('Failed to refresh faculties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faculties</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/faculties/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Faculty
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading faculties...</p>
          </div>
        ) : faculties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No faculties found</p>
            <button
              onClick={() => navigate('/faculties/create')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Create the first faculty
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {faculties.map((faculty) => (
              <div
                key={faculty._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {faculty.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/faculties/${faculty._id}/edit`)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faculty._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  Created: {new Date(faculty.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
