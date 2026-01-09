import { useState, useEffect, useRef } from 'react';
import { allocationAPI } from '../api/allocationAPI';
import { facultyAPI } from '../api/facultyAPI';
import { useReferenceData } from '../context/useReferenceData';
import AllocationModal from '../components/AllocationModal';
import BatchEditModal from '../components/BatchEditModal';

const DAY_PATTERNS = ['MWF', 'TTS', 'REGULAR'];

export default function ScheduleView() {
  const { labs, timeSlots, loading: refDataLoading, error: refDataError } = useReferenceData();
  const [allocations, setAllocations] = useState([]);
  const [freeFacultiesBySlot, setFreeFacultiesBySlot] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedAllocation, setDraggedAllocation] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const refreshTimeoutRef = useRef(null);

  // Fetch schedule data once reference data is loaded
  useEffect(() => {
    if (!refDataLoading) {
      fetchScheduleData();
    }
  }, [refDataLoading]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const [allocRes, freeFacRes] = await Promise.all([
        allocationAPI.getAll(),
        facultyAPI.getFreeFacultiesBySlot()
      ]);

      setAllocations(allocRes.data || []);
      setFreeFacultiesBySlot(freeFacRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllocation = (labId, timeSlotId, dayPattern) => {
    return allocations.find(
      alloc => alloc.lab._id === labId && 
               alloc.timeSlot._id === timeSlotId && 
               alloc.dayPattern === dayPattern
    );
  };

  const handleCellClick = (lab, timeSlot, dayPattern) => {
    setSelectedCell({ lab, timeSlot, dayPattern });
    setShowModal(true);
  };

  const handleAllocationAdded = async (newAllocation) => {
    setAllocations([...allocations, newAllocation]);
    // Debounced refresh of free faculties
    debouncedRefreshFreeFaculties();
    setShowModal(false);
  };

  const handleAllocationRemoved = async (allocationId) => {
    setAllocations(allocations.filter(a => a._id !== allocationId));
    // Debounced refresh of free faculties
    debouncedRefreshFreeFaculties();
  };

  const debouncedRefreshFreeFaculties = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      refreshFreeFaculties();
    }, 500);
  };

  const refreshFreeFaculties = async () => {
    try {
      const freeFacRes = await facultyAPI.getFreeFacultiesBySlot();
      setFreeFacultiesBySlot(freeFacRes.data || []);
    } catch (err) {
      console.error('Failed to refresh free faculties:', err);
    }
  };

  const handleBatchUpdated = (updatedBatch) => {
    // Update allocations with new batch data
    setAllocations(prev =>
      prev.map(alloc =>
        alloc.batch._id === updatedBatch._id
          ? { ...alloc, batch: updatedBatch }
          : alloc
      )
    );
    setEditingAllocation(null);
  };

  const handleDragStart = (e, allocation) => {
    e.stopPropagation();
    setDraggedAllocation(allocation);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, cellKey) => {
    e.preventDefault();
    setDragOverCell(cellKey);
  };

  const handleDragLeave = (e) => {
    if (e.target === e.currentTarget) {
      setDragOverCell(null);
    }
  };

  const handleDrop = async (e, lab, timeSlot, dayPattern) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCell(null);

    if (!draggedAllocation) return;

    const cellKey = `${lab._id}-${timeSlot._id}-${dayPattern}`;
    const draggedCellKey = `${draggedAllocation.lab._id}-${draggedAllocation.timeSlot._id}-${draggedAllocation.dayPattern}`;

    // If dropped on same cell, do nothing
    if (cellKey === draggedCellKey) {
      setDraggedAllocation(null);
      return;
    }

    const targetAllocation = getAllocation(lab._id, timeSlot._id, dayPattern);

    // If target cell is empty, move the allocation
    if (!targetAllocation) {
      try {
        // Update allocation to new location
        const updated = await allocationAPI.update(draggedAllocation._id, {
          lab: lab._id,
          batch: draggedAllocation.batch._id,
          timeSlot: timeSlot._id,
          dayPattern: dayPattern
        });

        if (!updated?.data) {
          throw new Error('Failed to update allocation - invalid response');
        }

        setAllocations(prev =>
          prev.map(alloc =>
            alloc._id === draggedAllocation._id
              ? updated.data
              : alloc
          )
        );
        // Debounced refresh of free faculties after move
        debouncedRefreshFreeFaculties();
      } catch (err) {
        alert('Failed to move allocation: ' + err.message);
      }
    } else {
      // If target cell has allocation, swap them
      try {
        const [updated1, updated2] = await Promise.all([
          allocationAPI.update(draggedAllocation._id, {
            lab: lab._id,
            batch: draggedAllocation.batch._id,
            timeSlot: timeSlot._id,
            dayPattern: dayPattern
          }),
          allocationAPI.update(targetAllocation._id, {
            lab: draggedAllocation.lab._id,
            batch: targetAllocation.batch._id,
            timeSlot: draggedAllocation.timeSlot._id,
            dayPattern: draggedAllocation.dayPattern
          })
        ]);

        // Safety check for null data
        if (!updated1?.data || !updated2?.data) {
          throw new Error('Failed to update allocations - invalid response');
        }

        setAllocations(prev =>
          prev.map(alloc => {
            if (alloc._id === draggedAllocation._id) return updated1.data;
            if (alloc._id === targetAllocation._id) return updated2.data;
            return alloc;
          })
        );
        // Debounced refresh of free faculties after swap
        debouncedRefreshFreeFaculties();
      } catch (err) {
        alert('Failed to swap allocations: ' + err.message);
      }
    }

    setDraggedAllocation(null);
  };

  if (refDataLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="text-center">
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (refDataError || error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {refDataError || error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Schedule</h1>
          <p className="text-gray-600 text-sm">
            💡 Drag and drop allocations to move or swap between cells
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border px-4 py-3 text-left font-bold sticky left-0 bg-blue-600 z-10 min-w-48">
                  Lab / Capacity
                </th>
                {timeSlots.map((slot) => (
                  <th
                    key={slot._id}
                    colSpan={DAY_PATTERNS.length}
                    className="border px-2 py-3 text-center font-bold text-sm"
                  >
                    {slot.label}
                  </th>
                ))}
              </tr>
              <tr className="bg-blue-500 text-white">
                <th className="border px-4 py-2 sticky left-0 bg-blue-500 z-10"></th>
                {timeSlots.map((slot) =>
                  DAY_PATTERNS.map((pattern) => (
                    <th
                      key={`${slot._id}-${pattern}`}
                      className="border px-2 py-2 text-center font-semibold text-xs"
                    >
                      {pattern}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-4 font-semibold bg-gray-50 sticky left-0 z-10">
                    <div className="text-sm">
                      <p className="font-bold">{lab.code}</p>
                      <p className="text-gray-600 text-xs">Cap: {lab.capacity}</p>
                      {lab.location && (
                        <p className="text-gray-500 text-xs">{lab.location}</p>
                      )}
                    </div>
                  </td>
                  {timeSlots.map((slot) =>
                    DAY_PATTERNS.map((pattern) => {
                      const alloc = getAllocation(lab._id, slot._id, pattern);
                      const cellKey = `${lab._id}-${slot._id}-${pattern}`;
                      const isDragOver = dragOverCell === cellKey;

                      return (
                        <td
                          key={cellKey}
                          className={`border px-2 py-3 cursor-pointer transition min-h-64 ${
                            isDragOver ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-blue-50'
                          }`}
                          onDragOver={handleDragOver}
                          onDragEnter={(e) => handleDragEnter(e, cellKey)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, lab, slot, pattern)}
                          onClick={() => handleCellClick(lab, slot, pattern)}
                        >
                          {alloc ? (
                            <AllocationCell
                              allocation={alloc}
                              onDragStart={handleDragStart}
                              onRemove={handleAllocationRemoved}
                              onEdit={setEditingAllocation}
                            />
                          ) : (
                            <div className="text-gray-300 text-center text-2xl">+</div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedCell && (
          <AllocationModal
            lab={selectedCell.lab}
            timeSlot={selectedCell.timeSlot}
            dayPattern={selectedCell.dayPattern}
            existingAllocation={getAllocation(
              selectedCell.lab._id,
              selectedCell.timeSlot._id,
              selectedCell.dayPattern
            )}
            onClose={() => setShowModal(false)}
            onAllocationAdded={handleAllocationAdded}
            onAllocationRemoved={handleAllocationRemoved}
          />
        )}

        {editingAllocation && (
          <BatchEditModal
            allocation={editingAllocation}
            onClose={() => setEditingAllocation(null)}
            onBatchUpdated={handleBatchUpdated}
          />
        )}

        {/* Free Faculties Summary */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Free Faculties Summary (Day-wise)</h2>
            <div className="space-y-6">
              {freeFacultiesBySlot.map((slotData) => (
                <div key={slotData.timeSlot._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-purple-600 text-white px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold">{slotData.timeSlot.label}</h3>
                        {slotData.timeSlot.startTime && slotData.timeSlot.endTime && (
                          <p className="text-purple-100 text-sm">
                            {slotData.timeSlot.startTime} - {slotData.timeSlot.endTime}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{slotData.stats.completelFree + slotData.stats.partiallyFree}</div>
                        <div className="text-purple-100 text-xs">Faculty Available</div>
                      </div>
                    </div>
                  </div>

                  {/* Completely Free Faculties */}
                  {slotData.completelFreeFaculties.length > 0 && (
                    <div className="border-b px-6 py-4">
                      <h4 className="font-semibold text-green-700 mb-3">
                        ✓ Completely Free ({slotData.stats.completelFree})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {slotData.completelFreeFaculties.map((item) => (
                          <span
                            key={item.faculty._id}
                            className="inline-block bg-green-100 border border-green-400 rounded-full px-3 py-1 text-xs font-semibold text-green-800"
                          >
                            {item.faculty.name} <span className="text-green-600 ml-1">(MWF, TTS, REGULAR)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Partially Free Faculties */}
                  {slotData.partiallyFreeFaculties.length > 0 && (
                    <div className="border-b px-6 py-4">
                      <h4 className="font-semibold text-yellow-700 mb-3">
                        ⚠ Partially Free ({slotData.stats.partiallyFree})
                      </h4>
                      <div className="space-y-2">
                        {slotData.partiallyFreeFaculties.map((item) => (
                          <div key={item.faculty._id} className="flex items-center justify-between bg-yellow-50 p-3 rounded border border-yellow-200">
                            <span className="font-medium text-gray-800">{item.faculty.name}</span>
                            <div className="flex gap-2">
                              {item.freeDayPatterns.map((pattern) => (
                                <span
                                  key={pattern}
                                  className="inline-block bg-green-100 border border-green-400 rounded px-2 py-1 text-xs font-semibold text-green-800"
                                >
                                  ✓ {pattern}
                                </span>
                              ))}
                              {item.busyDayPatterns.map((pattern) => (
                                <span
                                  key={pattern}
                                  className="inline-block bg-red-100 border border-red-400 rounded px-2 py-1 text-xs font-semibold text-red-800"
                                >
                                  ✗ {pattern}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Busy Faculties */}
                  {slotData.busyFaculties.length > 0 && (
                    <div className="px-6 py-4">
                      <h4 className="font-semibold text-red-700 mb-3">
                        ✗ Busy ({slotData.stats.busy})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {slotData.busyFaculties.map((item) => (
                          <span
                            key={item.faculty._id}
                            className="inline-block bg-red-100 border border-red-400 rounded-full px-3 py-1 text-xs font-semibold text-red-800"
                          >
                            {item.faculty.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllocationCell({ allocation, onDragStart, onRemove, onEdit }) {
  const batch = allocation?.batch;
  
  // Safety check: if batch is null, don't render
  if (!batch) {
    return null;
  }
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Remove this allocation?')) {
      try {
        const { allocationAPI } = await import('../api/allocationAPI');
        await allocationAPI.delete(allocation._id);
        onRemove(allocation._id);
      } catch (err) {
        alert('Failed to remove allocation: ' + err.message);
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, allocation)}
      className="bg-green-100 border border-green-400 rounded p-2 text-xs cursor-grab active:cursor-grabbing hover:shadow-lg transition h-full"
    >
      <div className="space-y-1">
        <p 
          className="font-bold text-green-900 truncate cursor-pointer hover:underline text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(allocation);
          }}
        >
          {batch.code}
        </p>
        {batch.faculty && (
          <p className="text-green-800 truncate text-xs">
            <span className="font-semibold">Faculty:</span> {batch.faculty.name}
          </p>
        )}
        {batch.currentSemester && (
          <p className="text-green-800 truncate text-xs">
            <span className="font-semibold">Sem:</span> {batch.currentSemester}
          </p>
        )}
        {batch.currentBook && (
          <p className="text-green-800 truncate text-xs">
            <span className="font-semibold">Book:</span> {batch.currentBook.title}
          </p>
        )}
        {batch.upcomingBook && (
          <p className="text-green-800 truncate text-xs">
            <span className="font-semibold">Next:</span> {batch.upcomingBook.title}
          </p>
        )}
        {batch.numberOfStudents > 0 && (
          <p className="text-green-800 truncate text-xs">
            <span className="font-semibold">Students:</span> {batch.numberOfStudents}
          </p>
        )}
      </div>
      <div className="flex gap-1 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(allocation);
          }}
          className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 rounded font-semibold"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white py-1 rounded font-semibold"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
