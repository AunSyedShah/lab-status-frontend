import { useState, useEffect } from 'react';
import { batchAPI } from '../api/batchAPI';
import { allocationAPI } from '../api/allocationAPI';

export default function AllocationModal({
  lab,
  timeSlot,
  dayPattern,
  existingAllocation,
  onClose,
  onAllocationAdded,
  onAllocationRemoved
}) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(
    existingAllocation?.batch._id || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      setBatches(response.data || []);
    } catch (err) {
      setError('Failed to load batches: ' + err.message);
    }
  };

  const handleAssign = async () => {
    if (!selectedBatch) {
      setError('Please select a batch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allocationData = {
        lab: lab._id,
        batch: selectedBatch,
        timeSlot: timeSlot._id,
        dayPattern: dayPattern
      };

      const response = await allocationAPI.create(allocationData);
      onAllocationAdded(response.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!existingAllocation) return;

    try {
      setLoading(true);
      await allocationAPI.delete(existingAllocation._id);
      onAllocationRemoved(existingAllocation._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Manage Allocation
        </h2>

        <div className="mb-6 space-y-2 text-sm">
          <p>
            <span className="font-semibold">Lab:</span> {lab.code} (Cap: {lab.capacity})
          </p>
          <p>
            <span className="font-semibold">Time:</span> {timeSlot.label}
          </p>
          <p>
            <span className="font-semibold">Pattern:</span> {dayPattern}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!existingAllocation ? (
          <>
            <div className="mb-6">
              <label htmlFor="batch" className="block text-gray-700 font-bold mb-2">
                Select Batch
              </label>
              <select
                id="batch"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
              >
                <option value="">-- Choose a batch --</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.code} {batch.faculty ? `(${batch.faculty.name})` : '(No Faculty)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAssign}
                disabled={loading || !selectedBatch}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
              >
                {loading ? 'Assigning...' : 'Assign Batch'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="font-semibold text-green-900 mb-1">
                {existingAllocation.batch.code}
              </p>
              {existingAllocation.batch.faculty && (
                <p className="text-sm text-green-800">
                  {existingAllocation.batch.faculty.name}
                </p>
              )}
              {existingAllocation.batch.numberOfStudents && (
                <p className="text-xs text-green-700 mt-2">
                  {existingAllocation.batch.numberOfStudents} students
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRemove}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
              >
                {loading ? 'Removing...' : 'Remove Allocation'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
