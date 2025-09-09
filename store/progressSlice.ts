import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadUserProgressFromFirebase, updateUserProgressInFirebase } from './firebaseThunks';

export interface ProgressStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  domainStats: Array<{
    domain: string;
    interviews: number;
    averageScore: number;
  }>;
  difficultyStats: {
    easy: { completed: number; averageScore: number };
    medium: { completed: number; averageScore: number };
    hard: { completed: number; averageScore: number };
  };
}

export interface ProgressState {
  stats: ProgressStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: ProgressState = {
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgressStats: (state, action: PayloadAction<ProgressStats>) => {
      state.stats = action.payload;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearProgress: (state) => {
      state.stats = null;
      state.error = null;
      state.lastUpdated = null;
    },
    updateProgressStats: (state, action: PayloadAction<Partial<ProgressStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user progress
      .addCase(loadUserProgressFromFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserProgressFromFirebase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadUserProgressFromFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update user progress
      .addCase(updateUserProgressInFirebase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProgressInFirebase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserProgressInFirebase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProgressStats,
  setLoading,
  setError,
  clearProgress,
  updateProgressStats,
} = progressSlice.actions;

export default progressSlice.reducer;
