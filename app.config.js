import "dotenv/config";

export default {
  expo: {
    name: "interviewguru",
    slug: "interviewguru",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/intervewguru-logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/intervewguru-logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      "supportsTablet": false,
      "bundleIdentifier": "com.interviewguru.interviewguru"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/intervewguru-logo.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.interviewguru.interviewguru",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/intervewguru-logo.png",
    },
    plugins: ["expo-router"],
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      eas: {
        projectId: "21ccbd9b-9c08-474f-b540-3c459ee33c0f",
      },
    },
  },
};
