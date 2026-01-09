/**
 * fetchWithTimeout - Wrapper around fetch API with timeout support using AbortController
 * Provides configurable timeouts based on request type and better error handling
 * 
 * @param {string} url - The URL to fetch
 * @param {object} options - Standard fetch options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Response>} - Standard fetch Response object
 * @throws {Error} - Throws TimeoutError or standard fetch errors
 */

export class TimeoutError extends Error {
  constructor(message = 'Request timeout', timeoutMs = null) {
    super(message);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Determines appropriate timeout based on request method and endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - Request URL
 * @returns {number} - Timeout in milliseconds
 */
function getTimeoutForRequest(method, url) {
  // Seed endpoint is slow, needs longer timeout
  if (url.includes('/seed')) {
    return 30000; // 30 seconds
  }
  
  // Write operations (POST, PUT, DELETE) might take longer
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    return 15000; // 15 seconds
  }
  
  // Read operations (GET) should be fast
  if (method === 'GET') {
    return 10000; // 10 seconds
  }
  
  // Default fallback
  return 10000;
}

/**
 * Performs a fetch request with a timeout
 * @param {string} url - The URL to fetch
 * @param {object} options - Standard fetch options (method, headers, body, etc.)
 * @param {number} timeoutMs - Optional custom timeout in milliseconds
 * @returns {Promise<Response>} - The fetch response
 * @throws {TimeoutError} - If request exceeds timeout
 * @throws {Error} - Network or other fetch errors
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = null) {
  const method = options.method || 'GET';
  
  // Use provided timeout or determine based on request type
  const timeout = timeoutMs || getTimeoutForRequest(method, url);
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  try {
    // Merge abort signal with provided options
    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle abort/timeout errors
    if (error.name === 'AbortError') {
      throw new TimeoutError(
        `Request to ${method} ${url} timed out after ${timeout}ms`,
        timeout
      );
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Parse API error response and extract details
 * @param {Response} response - The fetch response object
 * @returns {Promise<object>} - Parsed error object with code, message, details
 */
export async function parseErrorResponse(response) {
  const defaultError = {
    code: response.status,
    message: `HTTP ${response.status}: ${response.statusText}`,
    status: response.status,
    details: null,
  };
  
  try {
    const body = await response.json();
    
    // Check if backend returned structured error
    if (body.code || body.message) {
      return {
        code: body.code || response.status,
        message: body.message || defaultError.message,
        status: response.status,
        details: body.details || body,
      };
    }
    
    // Return body if no structured error but response has data
    return {
      ...defaultError,
      details: body,
    };
  } catch {
    // Could not parse JSON, return default
    return defaultError;
  }
}

/**
 * Convenience method combining fetchWithTimeout with automatic error parsing
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeoutMs - Custom timeout in milliseconds
 * @returns {Promise<object>} - Parsed JSON response or throws error with details
 */
export async function fetchAPI(url, options = {}, timeoutMs = null) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  
  // Handle non-2xx status codes
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    const err = new Error(error.message);
    err.status = error.status;
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
  
  // Parse and return successful response
  return response.json();
}
