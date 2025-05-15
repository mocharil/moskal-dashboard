import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slice/loginSlice";
import keywordReducer from "./slice/keywordSlice";
import topicReducer from "./slice/topicSlice";

// Configure the Redux store
const store = configureStore({
  reducer: {
    user: userReducer,
    keywords: keywordReducer,
    topics: topicReducer,
  },
});

export default store;
