import { persistor, store } from "@/store";
import { authPersistence } from "@/store/authPersistence";
import { initializeFromStorage } from "@/store/authSlice";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const AuthStateBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('Checking for stored user data...');
    
    const initializeFromStoredData = async () => {
      try {
        // Check if there's stored user data
        const storedUserData = await authPersistence.getUserData();
        if (storedUserData) {
          console.log('Found stored user data, initializing Redux state');
          dispatch(initializeFromStorage(storedUserData));
        } else {
          console.log('No stored user data found');
        }
      } catch (error) {
        console.error('Error initializing from stored data:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeFromStoredData();
  }, [dispatch]);

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
           </Stack>
        </AuthStateBridge>
      </PersistGate>
    </Provider>
  );
}

