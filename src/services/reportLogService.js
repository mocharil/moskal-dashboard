// Elasticsearch client and related logic have been removed as per request.
// Functions are modified to return empty/default data.

// const VITE_ES_HOST = import.meta.env.VITE_ES_HOST;
// const VITE_ES_USERNAME = import.meta.env.VITE_ES_USERNAME;
// const VITE_ES_PASSWORD = import.meta.env.VITE_ES_PASSWORD;

// let client;

// if (VITE_ES_HOST) {
//   // Client initialization removed
// } else {
//   console.error("Elasticsearch host URL (VITE_ES_HOST) is not defined in .env. ES functionality disabled.");
// }

/**
 * Fetches all report jobs. (Elasticsearch connection removed)
 * Returns an empty array.
 */
export const getReportJobs = async (size = 100) => { // Default to fetching 100 jobs
  console.warn("getReportJobs: Elasticsearch functionality has been removed. Returning empty array.");
  return []; // Return empty array as ES is disconnected
};

/**
 * Fetches a specific report detail. (Elasticsearch connection removed)
 * Returns null.
 */
export const getDetailedReport = async (topic, startDate, endDate) => {
  console.warn("getDetailedReport: Elasticsearch functionality has been removed. Returning null.");
  return null; // Return null as ES is disconnected
};

// You can add more functions here to query 'moskal-reports' if needed,
// for example, by a report ID if 'moskal-report-jobs' provides a direct link.
// These would also need to be implemented without direct ES client usage.
