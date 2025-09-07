import { auth } from '@/firebase/config';
import { AppDispatch } from '@/store';
import { clearAllData as clearAuthData } from '@/store/authSlice';
import { clearAllData as clearDomainData } from '@/store/domainSlice';
import { clearAllData as clearInterviewData } from '@/store/interviewSlice';
import { clearAllData as clearResumeData } from '@/store/resumeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';

export const logoutUser = async (dispatch: AppDispatch) => {
  try {

    await signOut(auth);
    
    // Clear all Redux state
    dispatch(clearAuthData());
    dispatch(clearDomainData());
    dispatch(clearInterviewData());
    dispatch(clearResumeData());
    
    // Clear all AsyncStorage data
    await AsyncStorage.clear();
    
    console.log('User logged out successfully and all data cleared');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};
