import { createSlice } from "@reduxjs/toolkit";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from "../../localStorageUtils";

// Define default state structure
const defaultState = {
  topics: [],
  unified_issue: "",
  description: "",
  list_issue: [],
  total_posts: 0,
  viral_score: 0,
  reach_score: 0,
  positive: 0,
  negative: 0,
  neutral: 0,
  share_of_voice: 0,
};

// Load from localStorage or fallback to default
const initialState = loadFromLocalStorage("topics") || defaultState;

const topicSlice = createSlice({
  name: "topics",
  initialState,
  reducers: {
    addTopics: (state, action) => {
      const { topics, expiresInDays } = action.payload;
      state.topics = topics.topics;
      state.unified_issue = topics.unified_issue;
      state.description = topics.description;
      state.list_issue = topics.list_issue;
      state.total_posts = topics.total_posts;
      state.viral_score = topics.viral_score;
      state.reach_score = topics.reach_score;
      state.positive = topics.positive;
      state.negative = topics.negative;
      state.neutral = topics.neutral;
      state.share_of_voice = topics.share_of_voice;

      // Save updated state to localStorage
      saveToLocalStorage("topics", state, expiresInDays);
    },
    deleteTopics: (state) => {
      // Reset to default structure with empty topics
      Object.assign(state, { ...defaultState, topics: [] });
      localStorage.removeItem("topics");
    },
  },
});

export const { addTopics, deleteTopics } = topicSlice.actions;
export default topicSlice.reducer;
