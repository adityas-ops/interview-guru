# Interview Guru

A React Native app for interview preparation with Firebase authentication and Redux state management.

## Features

- **Authentication**: Sign up, login, and logout functionality
- **Simple Persistence**: User data is stored in Redux and persisted to mobile storage
- **No Firebase Auth State**: Firebase is only used for login/signup, not for auth state management
- **State Management**: Redux with redux-persist for state persistence
- **Firebase Integration**: Authentication and Firestore database
- **Modern UI**: Clean and intuitive user interface

## Authentication Persistence

The app now uses a simple and effective approach:

### 🔐 **Simple User Data Persistence**
- **Redux Storage**: User data is stored in Redux state
- **AsyncStorage**: User data is automatically persisted to mobile storage
- **No Firebase Auth State**: Firebase authentication state is not managed by the app
- **Direct Storage**: User data is stored directly when logging in/signing up

### 📱 **How It Works**
1. **Login/Signup**: User data is stored in both Redux and AsyncStorage
2. **App Refresh**: Redux-persist automatically restores the state
3. **App Restart**: Stored data is retrieved from AsyncStorage and Redux state is restored
4. **Simple Flow**: No complex authentication state management, just data persistence

## How It Works

1. **App Launch**: 
   - Check AsyncStorage for existing user data
   - If found, restore Redux state immediately
   - If not found, user is not authenticated

2. **Authentication**: 
   - Firebase handles login/signup
   - User data is extracted and stored in Redux
   - Same data is stored in AsyncStorage for persistence

3. **State Management**: 
   - Redux state is automatically persisted by redux-persist
   - AsyncStorage provides additional persistence layer
   - Simple and reliable state management

4. **No Firebase Auth State**: 
   - Firebase is only used for authentication operations
   - App doesn't listen to Firebase auth state changes
   - User data persistence is completely independent

## File Structure

- `app/_layout.tsx` - Root layout with simple user data initialization
- `app/index.tsx` - Main routing logic based on Redux state
- `store/authSlice.ts` - Simple Redux slice for user data
- `store/authPersistence.ts` - Simple AsyncStorage service for user data
- `store/index.ts` - Redux store configuration with persistence
- `firebase/config.ts` - Firebase configuration (only for auth operations)
- `app/auth/` - Authentication screens (login, signup, onboarding)
- `app/main/` - Main app screens with persistence testing

## Recent Changes

- ✅ **SIMPLIFIED**: Removed complex Firebase authentication state management
- ✅ **FOCUSED**: Only store user data in Redux and AsyncStorage
- ✅ **RELIABLE**: Simple persistence without Firebase auth state dependencies
- ✅ **CLEAN**: Removed unnecessary loading states and initialization logic
- ✅ **EFFICIENT**: Direct data storage and retrieval approach

## Testing Authentication Persistence

1. **Login/Signup**: Use authentication screens to create/login to account
2. **Verify Storage**: Use "Check Stored Data" button to see stored user data
3. **Test Persistence**: 
   - Refresh the app (should stay logged in via Redux-persist)
   - Close and restart the app (should stay logged in via AsyncStorage)
   - Check console logs for simple initialization flow
4. **Logout Test**: Use logout button to clear all stored data

## Dependencies

- React Native with Expo
- Firebase v12.1.0 (only for auth operations)
- Redux Toolkit with redux-persist
- AsyncStorage for mobile storage persistence
- Expo Router for navigation

## How to Use

1. **Login/Signup**: User data is automatically stored in Redux and AsyncStorage
2. **App Refresh**: Redux-persist automatically restores the state
3. **App Restart**: App checks AsyncStorage and restores Redux state
4. **Logout**: Clears data from both Redux and AsyncStorage

## Benefits of This Approach

- **Simple**: No complex authentication state management
- **Reliable**: Direct data persistence without external dependencies
- **Fast**: Immediate state restoration from stored data
- **Independent**: Works regardless of Firebase authentication state
- **Maintainable**: Clean and straightforward code structure
