import { FirebaseUserData } from '@/services/firebaseDataService';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    clearUserDataFromFirebase,
    loadUserDataFromFirebase,
    saveDomainToFirebase,
    saveInterviewToFirebase,
    saveResumeToFirebase,
    saveUserDataToFirebase
} from './firebaseThunks';

export interface FirebaseState {
  userData: FirebaseUserData | null;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  isDataLoaded: boolean;
}

const initialState: FirebaseState = {
  userData: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,
  isDataLoaded: false,
};

const firebaseSlice = createSlice({
  name: 'firebase',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<FirebaseUserData | null>) => {
      state.userData = action.payload;
      state.isDataLoaded = true;
      state.lastSyncTime = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearFirebaseData: (state) => {
      state.userData = null;
      state.isLoading = false;
      state.error = null;
      state.lastSyncTime = null;
      state.isDataLoaded = false;
    },
    updateDomainData: (state, action: PayloadAction<any>) => {
      if (state.userData) {
        state.userData.domainData = action.payload;
        state.lastSyncTime = new Date().toISOString();
      }
    },
    updateResumeData: (state, action: PayloadAction<any>) => {
      if (state.userData) {
        state.userData.resumeData = action.payload;
        state.lastSyncTime = new Date().toISOString();
      }
    },
    addReport: (state, action: PayloadAction<any>) => {
      if (state.userData) {
        state.userData.reports.unshift(action.payload);
        // Keep only last 50 reports
        if (state.userData.reports.length > 50) {
          state.userData.reports = state.userData.reports.slice(0, 50);
        }
        state.lastSyncTime = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user data
      .addCase(loadUserDataFromFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserDataFromFirebase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload;
        state.isDataLoaded = true;
        state.lastSyncTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(loadUserDataFromFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save user data
      .addCase(saveUserDataToFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveUserDataToFirebase.fulfilled, (state) => {
        state.isLoading = false;
        state.lastSyncTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(saveUserDataToFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save interview
      .addCase(saveInterviewToFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveInterviewToFirebase.fulfilled, (state) => {
        state.isLoading = false;
        state.lastSyncTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(saveInterviewToFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save domain
      .addCase(saveDomainToFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDomainToFirebase.fulfilled, (state) => {
        state.isLoading = false;
        state.lastSyncTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(saveDomainToFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save resume
      .addCase(saveResumeToFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveResumeToFirebase.fulfilled, (state) => {
        state.isLoading = false;
        state.lastSyncTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(saveResumeToFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Clear user data
      .addCase(clearUserDataFromFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearUserDataFromFirebase.fulfilled, (state) => {
        state.isLoading = false;
        state.userData = null;
        state.isDataLoaded = false;
        state.lastSyncTime = null;
        state.error = null;
      })
      .addCase(clearUserDataFromFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUserData,
  setLoading,
  setError,
  clearFirebaseData,
  updateDomainData,
  updateResumeData,
  addReport,
} = firebaseSlice.actions;

export default firebaseSlice.reducer;
