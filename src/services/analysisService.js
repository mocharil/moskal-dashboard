import axios from "axios";

const API_BASE = import.meta.env.VITE_DATA_API_BASE;

export const getAnalysisOverview = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/analysis-overview`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getMostShareVoice = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/most-share-of-voice`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getMostFollowers = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/most-followers`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getTrendingHashtag = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/trending-hashtags`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getTrendingLink = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/trending-links`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getMentionSentimentBreakdown = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/mention-sentiment-breakdown`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getPopularEmojis = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/popular-emojis`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getPresenceScore = async (topicToWatchData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/presence-score`,
      topicToWatchData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};
