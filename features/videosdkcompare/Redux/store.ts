import { configureStore } from "@reduxjs/toolkit";
import meetingReducer from "./meetingSlice";

export const store = configureStore({
  reducer: {
    meeting: meetingReducer,
    // other reducers here...
  },
  devTools: {
    name: "SDK-Compare",
    trace: process.env.NODE_ENV !== "production",
    actionsDenylist: [
      "meeting/updateNetworkLevel",
      "meeting/updateLocalVideoStats",
      "meeting/updateRemoteUserVideoTrackStats",
    ],
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
