import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@auth_user_data';

export interface StoredAuthData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerId: string | null;
  lastLogin: number;
}

class AuthPersistenceService {
  // Store user data in AsyncStorage
  async storeUserData(userData: StoredAuthData): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      // console.log('User data stored in AsyncStorage:', userData);
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  // Retrieve user data from AsyncStorage
  async getUserData(): Promise<StoredAuthData | null> {
    try {
      const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedData) {
        const userData = JSON.parse(storedData) as StoredAuthData;
        // console.log('Retrieved stored user data:', userData);
        return userData;
      }
    } catch (error) {
      console.error('Failed to retrieve stored user data:', error);
    }
    return null;
  }

  // Clear stored user data
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      // console.log('Stored user data cleared');
    } catch (error) {
      console.error('Failed to clear stored user data:', error);
    }
  }

  // Check if user data exists
  async hasUserData(): Promise<boolean> {
    try {
      const storedData = await this.getUserData();
      return storedData !== null;
    } catch (error) {
      console.error('Error checking user data:', error);
      return false;
    }
  }
}

export const authPersistence = new AuthPersistenceService();
export default authPersistence;
