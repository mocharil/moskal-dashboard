import { createSlice } from "@reduxjs/toolkit";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from "../../localStorageUtils";

// Define initial state (load from localStorage or use default)
const initialState = loadFromLocalStorage("user") || {
  name: "",
  email: "",
  token: "",
  refreshToken: "",
  tokenType: "",
  id: null, // Added id field
  isLoggedIn: false,
  tokenExpiration: null,
};

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const {
        name,
        email,
        token,
        refreshToken,
        tokenType,
        userId,
        expiresInDays,
      } = action.payload;
      const expirationDate =
        new Date().getTime() + expiresInDays * 24 * 60 * 60 * 1000; // Expiration in ms

      console.log();

      state.name = name;
      state.email = email;
      state.token = token;
      state.refreshToken = refreshToken;
      state.tokenType = tokenType;
      state.id = userId; // Store userId in state.id
      state.isLoggedIn = true;
      state.tokenExpiration = expirationDate;

      // Save to localStorage with token expiration date
      saveToLocalStorage(
        "user",
        {
          name,
          email,
          token,
          refreshToken,
          tokenType,
          id: userId, // Save id to localStorage
          isLoggedIn: true,
          tokenExpiration: expirationDate,
        },
        expiresInDays
      );
    },
    logout: (state) => {
      state.name = "";
      state.email = "";
      state.token = "";
      state.refreshToken = "";
      state.tokenType = "";
      state.id = null; // Clear id on logout
      state.isLoggedIn = false;
      state.tokenExpiration = null;

      // Remove from localStorage
      localStorage.removeItem("user");
    },
    refreshToken: (state, action) => {
      const { token, refreshToken, tokenType } = action.payload;

      state.token = token;
      state.refreshToken = refreshToken;
      state.tokenType = tokenType;
      state.tokenExpiration = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 1 week expiration

      // Update in localStorage
      saveToLocalStorage(
        "user",
        {
          ...state,
          token,
          refreshToken,
          tokenType,
          tokenExpiration: state.tokenExpiration,
        },
        state.tokenExpiration
      );
    },
  },
});

// Export actions
export const { login, logout, refreshToken } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
