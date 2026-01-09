import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookAPI } from '../api/bookAPI';
import { useReferenceData } from '../context/useReferenceData';

export default function BookList() {
  const { books, refreshBooks } = useReferenceData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookAPI.delete(id);
        // Refresh context data to reflect deletion
        await refreshBooks();
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to delete book');
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshBooks();
      setError(null);
    } catch {
      setError('Failed to refresh books');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Books</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/books/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Book
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
            <p className="text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No books found</p>
            <button
              onClick={() => navigate('/books/create')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Create the first book
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {book.title}
                </h2>
                <div className="text-gray-600 text-sm mb-4 space-y-1">
                  {book.author && (
                    <p>
                      <span className="font-semibold">Author:</span> {book.author}
                    </p>
                  )}
                  {book.isbn && (
                    <p>
                      <span className="font-semibold">ISBN:</span> {book.isbn}
                    </p>
                  )}
                  {book.edition && (
                    <p>
                      <span className="font-semibold">Edition:</span> {book.edition}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/books/${book._id}/edit`)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Created: {new Date(book.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
