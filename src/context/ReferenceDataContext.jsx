import { useState, useEffect, useRef, useCallback } from 'react';
import { ReferenceDataContext } from './ReferenceDataContextCreate';
import { labAPI } from '../api/labAPI';
import { facultyAPI } from '../api/facultyAPI';
import { batchAPI } from '../api/batchAPI';
import { bookAPI } from '../api/bookAPI';
import { timeSlotAPI } from '../api/timeSlotAPI';

export const ReferenceDataProvider = ({ children }) => {
  const [labs, setLabs] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [batches, setBatches] = useState([]);
  const [books, setBooks] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for request cancellation and deduplication
  const abortControllersRef = useRef({
    all: null,
    labs: null,
    faculties: null,
    batches: null,
    books: null,
    timeSlots: null
  });
  
  const pendingRequestsRef = useRef({
    all: null,
    labs: null,
    faculties: null,
    batches: null,
    books: null,
    timeSlots: null
  });

  // Cancel all pending requests
  const cancelAllRequests = () => {
    Object.values(abortControllersRef.current).forEach(controller => {
      if (controller) controller.abort();
    });
  };

  // Cancel specific request
  const cancelRequest = (key) => {
    if (abortControllersRef.current[key]) {
      abortControllersRef.current[key].abort();
      abortControllersRef.current[key] = null;
      pendingRequestsRef.current[key] = null;
    }
  };

  const fetchAllReferenceData = useCallback(async () => {
    // Cancel previous request if still pending
    cancelRequest('all');
    
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllersRef.current.all = controller;
    
    // If request already pending, return that promise instead (deduplication)
    if (pendingRequestsRef.current.all) {
      return pendingRequestsRef.current.all;
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        setLoading(true);
        const [labsRes, facultiesRes, batchesRes, booksRes, timeSlotsRes] = await Promise.all([
          labAPI.getAll(),
          facultyAPI.getAll(),
          batchAPI.getAll(),
          bookAPI.getAll(),
          timeSlotAPI.getAll()
        ]);

        // Check if request was cancelled
        if (controller.signal.aborted) return;

        setLabs(labsRes.data || []);
        setFaculties(facultiesRes.data || []);
        setBatches(batchesRes.data || []);
        setBooks(booksRes.data || []);
        
        const sortedSlots = (timeSlotsRes.data || []).sort((a, b) => a.orderIndex - b.orderIndex);
        setTimeSlots(sortedSlots);
        
        setError(null);
      } catch (err) {
        // Ignore abort errors
        if (err.name === 'AbortError') return;
        
        setError(err.message);
        console.error('Failed to load reference data:', err);
      } finally {
        setLoading(false);
        pendingRequestsRef.current.all = null;
      }
    })();

    pendingRequestsRef.current.all = requestPromise;
    return requestPromise;
  }, []);

  useEffect(() => {
    fetchAllReferenceData();
    
    // Cleanup on unmount
    return () => {
      cancelAllRequests();
    };
  }, [fetchAllReferenceData]);

  // Helper function to create a generic refresh with deduplication
  const createRefreshFunction = (key, apiFn, setStateFn) => {
    return async () => {
      // Cancel previous request if still pending
      cancelRequest(key);
      
      // Create new abort controller
      const controller = new AbortController();
      abortControllersRef.current[key] = controller;
      
      // If request already pending, return that promise (deduplication)
      if (pendingRequestsRef.current[key]) {
        return pendingRequestsRef.current[key];
      }

      const requestPromise = (async () => {
        try {
          const res = await apiFn();
          
          // Check if request was cancelled
          if (controller.signal.aborted) return;

          if (key === 'timeSlots') {
            const sortedSlots = (res.data || []).sort((a, b) => a.orderIndex - b.orderIndex);
            setStateFn(sortedSlots);
          } else {
            setStateFn(res.data || []);
          }
        } catch (err) {
          // Ignore abort errors
          if (err.name === 'AbortError') return;
          
          console.error(`Failed to refresh ${key}:`, err);
        } finally {
          pendingRequestsRef.current[key] = null;
        }
      })();

      pendingRequestsRef.current[key] = requestPromise;
      return requestPromise;
    };
  };

  const value = {
    labs,
    faculties,
    batches,
    books,
    timeSlots,
    loading,
    error,
    refetch: fetchAllReferenceData,
    refreshLabData: createRefreshFunction('labs', labAPI.getAll, setLabs),
    refreshFaculties: createRefreshFunction('faculties', facultyAPI.getAll, setFaculties),
    refreshBatches: createRefreshFunction('batches', batchAPI.getAll, setBatches),
    refreshBooks: createRefreshFunction('books', bookAPI.getAll, setBooks),
    refreshTimeSlots: createRefreshFunction('timeSlots', timeSlotAPI.getAll, setTimeSlots)
  };

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
};
