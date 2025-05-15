import axios from "axios";

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;
const SUGGESTION_API = import.meta.env.VITE_REPORT_API_BASE;

export const getProjects = async () => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.get(`${API_BASE}/project/projects`, {
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

export const postOnboarding = async (onboardingData) => {
  try {
    const authData = JSON.parse(localStorage.getItem("user"));
    const token = authData?.value?.token;
    const response = await axios.post(
      `${API_BASE}/project/onboarding`,
      onboardingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const getKeywordSuggestions = async (topic) => {
  try {
    const response = await axios.post(
      `${SUGGESTION_API}/generate-sub-keywords?topic=${encodeURIComponent(topic)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch keyword suggestions:", error);
    throw error;
  }
};
