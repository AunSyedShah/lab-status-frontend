import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchAPI } from '../api/batchAPI';

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getAll();
      setBatches(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await batchAPI.delete(id);
        setBatches(batches.filter(batch => batch._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
          <button
            onClick={() => navigate('/batches/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Batch
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No batches found</p>
            <button
              onClick={() => navigate('/batches/create')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Create the first batch
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {batch.code}
                </h2>
                <div className="text-gray-600 text-sm mb-4 space-y-2">
                  {batch.faculty && (
                    <p>
                      <span className="font-semibold">Faculty:</span> {batch.faculty.name}
                    </p>
                  )}
                  {batch.currentSemester && (
                    <p>
                      <span className="font-semibold">Semester:</span> {batch.currentSemester}
                    </p>
                  )}
                  {batch.currentBook && (
                    <p>
                      <span className="font-semibold">Current Book:</span> {batch.currentBook.title}
                    </p>
                  )}
                  {batch.upcomingBook && (
                    <p>
                      <span className="font-semibold">Upcoming Book:</span> {batch.upcomingBook.title}
                    </p>
                  )}
                  {batch.numberOfStudents && (
                    <p>
                      <span className="font-semibold">Students:</span> {batch.numberOfStudents}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/batches/${batch._id}/edit`)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(batch._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Created: {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
