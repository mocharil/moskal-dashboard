const API_BASE_URL = "/report-api";

/**
 * Fetches report jobs from the API with pagination.
 */
export const getReportJobs = async (email = "", page = 1, size = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/list_jobs?email=${encodeURIComponent(email)}&page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Try to parse error response from API if available
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage; // Use API's error detail if present
      } catch (e) {
        // Ignore if error response is not JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // The API response structure is { status, page, size, total, count, data: [...] }
    // We need to return the array of reports and pagination info
    return {
      reports: data.data || [],
      page: data.page,
      size: data.size,
      total: data.total,
      count: data.count,
    };
  } catch (error) {
    console.error("Failed to fetch report jobs:", error);
    throw error; // Re-throw the error to be caught by the calling component
  }
};

/**
 * Fetches a specific report detail. (Original functionality kept, but ES connection removed)
 * Returns null.
 */
export const getDetailedReport = async (topic, startDate, endDate) => {
  console.warn("getDetailedReport: Elasticsearch functionality has been removed. Returning null.");
  return null; // Return null as ES is disconnected
};

/**
 * Calls the API to regenerate a report.
 * @param {string} jobId - The ID of the job to regenerate.
 * @param {object} params - Optional parameters for regeneration.
 * @param {string} [params.email] - Optional new email.
 * @param {string} [params.start_date] - Optional new start date.
 * @param {string} [params.end_date] - Optional new end date.
 * @param {string[]} [params.sub_keywords] - Optional new list of sub keywords.
 */
export const regenerateReportJob = async (jobId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({ job_id: jobId });
    if (params.email) queryParams.append('email', params.email);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sub_keywords && params.sub_keywords.length > 0) {
      // The API expects sub_keywords as multiple query params with the same name
      params.sub_keywords.forEach(keyword => queryParams.append('sub_keywords', keyword));
    }

    const response = await fetch(`${API_BASE_URL}/regenerate-report?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      // Body is not needed as per the cURL example, parameters are in query string
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore if error response is not JSON
      }
      throw new Error(errorMessage);
    }

    return await response.json(); // Returns { status, message, data: { job_id } }
  } catch (error) {
    console.error("Failed to regenerate report job:", error);
    throw error;
  }
};
