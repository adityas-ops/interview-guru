import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./authSlice";
import domainReducer from "./domainSlice";
import firebaseReducer from "./firebaseSlice";
import interviewReducer from "./interviewSlice";
import progressReducer from "./progressSlice";
import resumeReducer from "./resumeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  resume: resumeReducer,
  domain: domainReducer,
  interview: interviewReducer,
  firebase: firebaseReducer,
  progress: progressReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "resume", "domain", "interview"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

