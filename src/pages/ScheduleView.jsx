import { useState, useEffect } from 'react';
import { labAPI } from '../api/labAPI';
import { allocationAPI } from '../api/allocationAPI';
import AllocationModal from '../components/AllocationModal';
import BatchEditModal from '../components/BatchEditModal';

const DAY_PATTERNS = ['MWF', 'TTS', 'REGULAR'];

export default function ScheduleView() {
  const [labs, setLabs] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedAllocation, setDraggedAllocation] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [editingAllocation, setEditingAllocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [labsRes, slotsRes, allocRes] = await Promise.all([
        labAPI.getAll(),
        fetch('http://localhost:3000/api/timeslots').then(r => r.json()),
        allocationAPI.getAll()
      ]);

      const sortedSlots = (slotsRes.data || []).sort((a, b) => a.orderIndex - b.orderIndex);
      setLabs(labsRes.data || []);
      setTimeSlots(sortedSlots);
      setAllocations(allocRes.data || []);
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

  const handleAllocationAdded = (newAllocation) => {
    setAllocations([...allocations, newAllocation]);
    setShowModal(false);
  };

  const handleAllocationRemoved = (allocationId) => {
    setAllocations(allocations.filter(a => a._id !== allocationId));
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

        setAllocations(prev =>
          prev.map(alloc =>
            alloc._id === draggedAllocation._id
              ? updated.data
              : alloc
          )
        );
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

        setAllocations(prev =>
          prev.map(alloc => {
            if (alloc._id === draggedAllocation._id) return updated1.data;
            if (alloc._id === targetAllocation._id) return updated2.data;
            return alloc;
          })
        );
      } catch (err) {
        alert('Failed to swap allocations: ' + err.message);
      }
    }

    setDraggedAllocation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="text-center">
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
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
      </div>
    </div>
  );
}

function AllocationCell({ allocation, onDragStart, onRemove, onEdit }) {
  const batch = allocation.batch;
  
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
