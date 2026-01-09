import { useState } from 'react';
import { batchAPI } from '../api/batchAPI';
import { useReferenceData } from '../context/useReferenceData';

export default function BatchEditModal({
  allocation,
  onClose,
  onBatchUpdated
}) {
  const batch = allocation.batch;
  const { faculties, books } = useReferenceData();
  const [formData, setFormData] = useState({
    code: batch.code,
    faculty: batch.faculty?._id || '',
    currentSemester: batch.currentSemester,
    currentBook: batch.currentBook?._id || '',
    upcomingBook: batch.upcomingBook?._id || '',
    numberOfStudents: batch.numberOfStudents || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        code: formData.code,
        faculty: formData.faculty,
        currentSemester: formData.currentSemester,
        currentBook: formData.currentBook || undefined,
        upcomingBook: formData.upcomingBook || undefined,
        numberOfStudents: formData.numberOfStudents ? parseInt(formData.numberOfStudents) : 0
      };

      const response = await batchAPI.update(batch._id, submitData);
      setSuccess('Batch updated successfully');
      
      setTimeout(() => {
        onBatchUpdated(response.data);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Edit Batch: {batch.code}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-gray-700 font-bold mb-1 text-sm">
                Batch Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="faculty" className="block text-gray-700 font-bold mb-1 text-sm">
                Faculty <span className="text-red-500">*</span>
              </label>
              <select
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">-- Select Faculty --</option>
                {faculties.map(faculty => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="currentSemester" className="block text-gray-700 font-bold mb-1 text-sm">
                Current Semester
              </label>
              <input
                type="text"
                id="currentSemester"
                name="currentSemester"
                value={formData.currentSemester}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="currentBook" className="block text-gray-700 font-bold mb-1 text-sm">
                Current Book
              </label>
              <select
                id="currentBook"
                name="currentBook"
                value={formData.currentBook}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">-- Select Book --</option>
                {books.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="upcomingBook" className="block text-gray-700 font-bold mb-1 text-sm">
                Upcoming Book
              </label>
              <select
                id="upcomingBook"
                name="upcomingBook"
                value={formData.upcomingBook}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">-- Select Book --</option>
                {books.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="numberOfStudents" className="block text-gray-700 font-bold mb-1 text-sm">
                Number of Students
              </label>
              <input
                type="number"
                id="numberOfStudents"
                name="numberOfStudents"
                value={formData.numberOfStudents}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition text-sm"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition text-sm"
              >
                Close
              </button>
            </div>
          </form>
        )}

        {success && !loading && (
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
