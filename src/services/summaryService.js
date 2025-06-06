import axios from "axios";

const API_BASE = "/data-api";

export const getSummaryOverview = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(`${API_BASE}/stats`, topicToWatchData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};
