import AnimateView from "@/components/AnimateView";
import { auth, db } from "@/firebase/config";
import { authPersistence } from "@/store/authPersistence";
import { setUser } from "@/store/authSlice";
import { Image } from "expo-image";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const Index = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()

  const onSignup = async () => {
    if (!email || !password || !name || !confirm) {
      Alert.alert("Missing info", "Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // First update the user profile
      if (res.user && name) {
        await updateProfile(res.user, { displayName: name });
      }
      
      // Save user data to Firestore after profile update
      try {
        if (db) {
          await setDoc(doc(db, 'users', res.user.uid), {
            name: name,
            email: email.trim(),
            uid: res.user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          // console.log('User data saved to Firestore successfully');
        } else {
          console.warn('Firestore not properly initialized, skipping Firestore save');
        }
      } catch (firestoreError: any) {
        console.error('Error saving to Firestore:', firestoreError);
        // Show a warning but don't block the signup process
        Alert.alert(
          "Warning", 
          "Account created but there was an issue saving additional data. You can continue using the app."
        );
      }
      
      const firebaseUser = res.user;
      
      // Create user data object
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        providerId: firebaseUser.providerData?.[0]?.providerId ?? null,
        lastLogin: Date.now(),
      };
      
      // Store user data in AsyncStorage
      await authPersistence.storeUserData(userData);
      
      const mapped = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        providerId: firebaseUser.providerData?.[0]?.providerId ?? null,
      };
      dispatch(setUser(mapped));
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign up failed", error?.message ?? "Unable to create account");
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} 
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.containerScroll}
          contentContainerStyle={styles.scrollContent} 
          bounces={false}
        >
          <AnimateView>
            <View style={styles.containerOuter}>
              <Image
                source={require("@/assets/images/intervewguru-logo.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.welcomeText}>
                Sign-Up into Interview Guru
              </Text>
              <View style={styles.inputContainerWrap}>
                {/* email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.textStyle}>
                    Email<Text style={styles.redText}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="example@gmail.com"
                    keyboardType="email-address"
       
                    inputMode="email"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                {/* name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.textStyle}>
                    Name<Text style={styles.redText}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder=" Aditya Sharma"
                    keyboardType="default"

                    inputMode="text"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                {/* password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.textStyle}>
                    Password<Text style={styles.redText}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="*******"
                    secureTextEntry={true}
             
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                {/* re enter password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.textStyle}>
                    Re-enter Password<Text style={styles.redText}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="*******"
                    secureTextEntry={true}
                  
                    value={confirm}
                    onChangeText={setConfirm}
                  />
                </View>
                <TouchableOpacity
                  onPress={onSignup}
                  activeOpacity={0.8}
                  style={styles.buttonContainer}
                >
                  <Text style={styles.buttonText}>{loading ? "Loading..." : "Create Account"}</Text>
                </TouchableOpacity>
                <View style={styles.dontAccountContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/auth/log-in");
                    }}
                    style={styles.buttonSign}
                  >
                    <Text style={styles.textSignin}>
                      Already have Account
                      <Text style={{ color: "#0062ffff" }}> Click Here</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </AnimateView>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  containerScroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, 
    justifyContent: "center", 
    paddingBottom: 20, 
  },
  containerOuter: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 70, 
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  welcomeText: {
    fontWeight: "900",
    fontSize: 22,
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
    fontWeight: "500",
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
    fontWeight: "600",
    color: "white",
  },
  dontAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingBottom: 20, 
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