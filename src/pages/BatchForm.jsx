import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { batchAPI } from '../api/batchAPI';
import { facultyAPI } from '../api/facultyAPI';
import { bookAPI } from '../api/bookAPI';

export default function BatchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    faculty: '',
    currentSemester: '',
    currentBook: '',
    upcomingBook: '',
    numberOfStudents: ''
  });
  const [faculties, setFaculties] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSelectionData();
    if (id) {
      fetchBatch();
    }
  }, [id]);

  const fetchSelectionData = async () => {
    try {
      const [facultyRes, bookRes] = await Promise.all([
        facultyAPI.getAll(),
        bookAPI.getAll()
      ]);
      setFaculties(facultyRes.data || []);
      setBooks(bookRes.data || []);
    } catch (err) {
      setError('Failed to load faculties and books');
    }
  };

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getById(id);
      const batch = response.data;
      setFormData({
        code: batch.code,
        faculty: batch.faculty?._id || '',
        currentSemester: batch.currentSemester,
        currentBook: batch.currentBook?._id || '',
        upcomingBook: batch.upcomingBook?._id || '',
        numberOfStudents: batch.numberOfStudents || ''
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

    if (!formData.code.trim()) {
      setError('Batch code is required');
      return;
    }

    if (!formData.faculty) {
      setError('Faculty is required');
      return;
    }

    if (!formData.currentSemester.trim()) {
      setError('Current semester is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        code: formData.code,
        faculty: formData.faculty,
        currentSemester: formData.currentSemester,
        numberOfStudents: formData.numberOfStudents ? parseInt(formData.numberOfStudents) : 0
      };

      // Only include book fields if they have values
      if (formData.currentBook && formData.currentBook.trim()) {
        submitData.currentBook = formData.currentBook;
      }
      if (formData.upcomingBook && formData.upcomingBook.trim()) {
        submitData.upcomingBook = formData.upcomingBook;
      }

      if (id) {
        await batchAPI.update(id, submitData);
        setSuccess('Batch updated successfully');
      } else {
        await batchAPI.create(submitData);
        setSuccess('Batch created successfully');
      }

      setTimeout(() => {
        navigate('/batches');
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
            {id ? 'Edit Batch' : 'Create Batch'}
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
                  Batch Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., CSE-2023-A"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="faculty" className="block text-gray-700 font-bold mb-2">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <select
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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

              <div className="mb-6">
                <label htmlFor="currentSemester" className="block text-gray-700 font-bold mb-2">
                  Current Semester <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="currentSemester"
                  name="currentSemester"
                  value={formData.currentSemester}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="currentBook" className="block text-gray-700 font-bold mb-2">
                  Current Book
                </label>
                <select
                  id="currentBook"
                  name="currentBook"
                  value={formData.currentBook}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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

              <div className="mb-6">
                <label htmlFor="upcomingBook" className="block text-gray-700 font-bold mb-2">
                  Upcoming Book
                </label>
                <select
                  id="upcomingBook"
                  name="upcomingBook"
                  value={formData.upcomingBook}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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

              <div className="mb-6">
                <label htmlFor="numberOfStudents" className="block text-gray-700 font-bold mb-2">
                  Number of Students
                </label>
                <input
                  type="number"
                  id="numberOfStudents"
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleChange}
                  placeholder="e.g., 45"
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
                  {loading ? 'Saving...' : id ? 'Update Batch' : 'Create Batch'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/batches')}
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
