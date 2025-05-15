import { createSlice } from "@reduxjs/toolkit";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from "../../localStorageUtils";

// Define initial state
const initialState = loadFromLocalStorage("keywords") || {
  keywords: [],
  activeKeyword: "",
};

// Create slice
const keywordsSlice = createSlice({
  name: "keywords",
  initialState,
  reducers: {
    addKeywords: (state, action) => {
      const { keywords, days } = action.payload;
      state.keywords = keywords;

      // Save to localStorage with expiration
      saveToLocalStorage("keywords", { ...state }, days);
    },
    deleteKeywords: (state) => {
      state.keywords = [];
      // Remove from localStorage
      localStorage.removeItem("keywords");
    },
    setActiveKeyword: (state, action) => {
      const { activeKeyword, days } = action.payload;
      state.activeKeyword = activeKeyword;

      // Save to localStorage with expiration
      saveToLocalStorage("keywords", { ...state }, days);
    },
  },
});

// Export actions
export const { addKeywords, deleteKeywords, setActiveKeyword } =
  keywordsSlice.actions;

// Export reducer
export default keywordsSlice.reducer;
