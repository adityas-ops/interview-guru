import { RootState } from "@/store";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSelector } from "react-redux";

export default function Index() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('Index: Checking authentication state - isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      // User is authenticated, redirect to main app
      console.log('Index: User authenticated, redirecting to /main');
      router.replace("/(tabs)");
    } else {
      // User is not authenticated, redirect to onboarding
      console.log('Index: User not authenticated, redirecting to /auth/onBoarding');
      router.replace("/auth/onBoarding");
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking auth state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#4184f8" />
    </View>
  );
}
