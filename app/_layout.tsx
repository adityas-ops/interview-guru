import { persistor, RootState, store } from "@/store";
import { authPersistence } from "@/store/authPersistence";
import { initializeFromStorage } from "@/store/authSlice";
import { loadUserDataFromFirebase, loadUserProgressFromFirebase, loadUserReportsFromFirebase } from "@/store/firebaseThunks";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const AuthStateBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const firebaseDataLoaded = useSelector((state: RootState) => state.firebase.isDataLoaded);

  useEffect(() => {
    // console.log('Checking for stored user data...');
    
    const initializeFromStoredData = async () => {
      try {
        // Check if there's stored user data
        const storedUserData = await authPersistence.getUserData();
        if (storedUserData) {
          // console.log('Found stored user data, initializing Redux state');
          dispatch(initializeFromStorage(storedUserData));
        } else {
          // console.log('No stored user data found');
        }
      } catch (error) {
        console.error('Error initializing from stored data:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeFromStoredData();
  }, [dispatch]);

  // Load Firebase data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !firebaseDataLoaded) {
      dispatch(loadUserDataFromFirebase() as any);
      dispatch(loadUserProgressFromFirebase() as any);
      dispatch(loadUserReportsFromFirebase() as any);
    }
  }, [isAuthenticated, firebaseDataLoaded, dispatch]);

  // Show loading spinner while checking stored data
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4184f8" />
      </View>
    );
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AuthStateBridge>
           <Stack screenOptions={{headerShown:false}}>
              <Stack.Screen name="(tabs)"/>
               <Stack.Screen name="auth"/>
                <Stack.Screen name="settings"/>
                <Stack.Screen name="homeRoutes"/>
                 <Stack.Screen name="interview"/>
                 <Stack.Screen name="learningWeb"/>
                 <Stack.Screen name="mikeTest"/>
           </Stack>
        </AuthStateBridge>
      </PersistGate>
    </Provider>
  );
}

