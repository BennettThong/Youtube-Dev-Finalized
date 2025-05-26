import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./Components/postsSlice"; // Adjust the import path as necessary

export default configureStore({
  reducer: {
    posts: postsReducer,
  },
});
