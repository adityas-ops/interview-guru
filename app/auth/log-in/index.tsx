import AnimateView from "@/components/AnimateView";
import { auth } from "@/firebase/config";
import { authPersistence } from "@/store/authPersistence";
import { setUser } from "@/store/authSlice";
import { Image } from "expo-image";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const Index = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }
    try {
      setLoading(true);
      
      const response = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      console.log("response", response);
      const firebaseUser = response.user;
      
      // Create user data object
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        providerId: firebaseUser.providerData?.[0]?.providerId ?? null,
        lastLogin: Date.now(),
      };
      
      // Store user data in AsyncStorage
      await authPersistence.storeUserData(userData);
      
      // Store user data in Redux
      const mapped = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        providerId: firebaseUser.providerData?.[0]?.providerId ?? null,
      };
      dispatch(setUser(mapped));
      
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login failed", error?.message ?? "Unable to login");
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <SafeAreaView style={styles.container}>
        <AnimateView>
          <View style={styles.containerOuter}>
            <Image
              source={require("@/assets/images/intervewguru-logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <View style={styles.inputContainerWrap}>
              <View style={styles.inputContainer}>
                <Text style={styles.textStyle}>
                  Email<Text style={styles.redText}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="example@gmail.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.textStyle}>
                  Password<Text style={styles.redText}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="*******"
                  secureTextEntry={true}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity
                onPress={onLogin}
                activeOpacity={0.8}
                style={styles.buttonContainer}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Loading..." : "Continue"}
                </Text>
              </TouchableOpacity>
              <View style={styles.dontAccountContainer}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/auth/sign-in");
                  }}
                  style={styles.buttonSign}
                >
                  <Text style={styles.textSignin}>
                    Don&apos;t have Account
                    <Text style={{ color: "#0062ffff" }}> Click Here</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimateView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  containerOuter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerInner: {
    width: "100%",
    maxWidth: "85%",
    justifyContent: "center",
    alignContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  welcomeText: {
    fontWeight: 900,
    fontSize: 32,
    color: "#2e2e2eff",
  },
  inputContainerWrap: {
    width: "85%",
    paddingTop: 45,
  },
  inputContainer: {
    marginBottom: 15,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: 500,
    color: "#3b3a3aff",
  },
  redText: {
    color: "red",
  },
  textInput: {
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#2e2e2eff",
    marginTop: 5,
    borderRadius: 8,
    color: "#000",
  },
  buttonContainer: {
    maxWidth: "100%",
    width: "100%",
    marginHorizontal: "auto",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#4184f8ff",
    marginVertical: 20,
    display: "flex",
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 600,
    color: "white",
  },
  dontAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonSign: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  textSignin: {
    fontSize: 18,
    textDecorationLine: "underline",
    textDecorationColor: "black",
    textDecorationStyle: "dotted",
  },
});

export default Index;
