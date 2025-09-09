import { firebaseDataService, FirebaseUserData, ProgressUpdate } from '@/services/firebaseDataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { DomainData } from './domainSlice';
import { RootState } from './index';
import { ResumeData } from './resumeSlice';

// Load user data from Firebase
export const loadUserDataFromFirebase = createAsyncThunk(
  'firebase/loadUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const userData = await firebaseDataService.loadUserData(userId);
      
      if (!userData) {
        // If no Firebase data exists, try to migrate from AsyncStorage
        const asyncStorageData = await AsyncStorage.getItem('persist:root');
        if (asyncStorageData) {
          const parsedData = JSON.parse(asyncStorageData);
          await firebaseDataService.migrateFromAsyncStorage(userId, parsedData);
          // Load the migrated data
          const migratedData = await firebaseDataService.loadUserData(userId);
          return migratedData;
        }
        return null;
      }

      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user data from Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);

// Save user data to Firebase
export const saveUserDataToFirebase = createAsyncThunk(
  'firebase/saveUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const userData: Partial<FirebaseUserData> = {
        domainData: state.domain.currentDomain,
        resumeData: state.resume.currentResume,
        reports: state.interview.report ? [state.interview.report] : []
      };

      await firebaseDataService.saveUserData(userId, userData);
      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save user data to Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);

// Save interview to Firebase
export const saveInterviewToFirebase = createAsyncThunk(
  'firebase/saveInterview',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      if (!state.domain.currentDomain) {
        throw new Error('Domain data is required');
      }
      
      if (!state.interview.questions || state.interview.questions.length === 0) {
        throw new Error('No questions available');
      }

      if (!state.interview.report) {
        throw new Error('No report available');
      }

      const interviewData = {
        domainData: state.domain.currentDomain,
        questions: state.interview.questions,
        userAnswers: state.interview.userAnswers || [],
        report: state.interview.report,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const interviewId = await firebaseDataService.saveInterview(userId, interviewData);
      
      // Also save the report separately
      await firebaseDataService.addReportToUser(userId, state.interview.report);
      
      return { interviewId, ...interviewData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save interview to Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);

// Save domain data to Firebase
export const saveDomainToFirebase = createAsyncThunk(
  'firebase/saveDomain',
  async (domainData: DomainData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await firebaseDataService.updateUserDomain(userId, domainData);
      return domainData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save domain to Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);

// Save resume data to Firebase
export const saveResumeToFirebase = createAsyncThunk(
  'firebase/saveResume',
  async (resumeData: ResumeData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await firebaseDataService.updateUserResume(userId, resumeData);
      return resumeData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save resume to Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);

// Clear user data from Firebase
export const clearUserDataFromFirebase = createAsyncThunk(
  'firebase/clearUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await firebaseDataService.clearUserData(userId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear user data from Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);

// Progress Management Thunks

// Load user progress from Firebase
export const loadUserProgressFromFirebase = createAsyncThunk(
  'firebase/loadUserProgress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('Loading progress for userId:', userId);
      const progressStats = await firebaseDataService.getProgressStats(userId);
      console.log('Progress stats loaded:', progressStats);
      return progressStats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user progress from Firebase';
      console.error('Error loading progress:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update user progress after completing an interview
export const updateUserProgressInFirebase = createAsyncThunk(
  'firebase/updateUserProgress',
  async (progressUpdate: ProgressUpdate, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await firebaseDataService.updateUserProgress(userId, progressUpdate);
      
      // Reload progress stats after update
      const updatedStats = await firebaseDataService.getProgressStats(userId);
      return updatedStats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user progress in Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);
