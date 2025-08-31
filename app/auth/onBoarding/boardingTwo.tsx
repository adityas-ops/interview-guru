import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BoardingTwo = () => {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [containerOpacity, containerTranslateY]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.containerInner,
          {
            opacity: containerOpacity,
            transform: [{ translateY: containerTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(143, 217, 205, 1)", "rgba(202, 236, 255, 1)"]}
          start={[0, 0]}
          style={styles.gradientBox}
        >
          <Ionicons name="document-text-outline" size={85} color="#4184f8ff" />
        </LinearGradient>
        {/* text */}
        <Text style={styles.headingText}>
            Resume-based Questions
        </Text>
        <Text style={styles.subHeadingText}>
         Upload your resume and receive tailored interview questions specific to your experience and target role
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.bubbleContainer,
          {
            opacity: containerOpacity,
            transform: [{ translateY: containerTranslateY }],
          },
        ]}
      >
        <View style={styles.bubble} />
        <View style={styles.activeBubble} />

        <View style={styles.bubble} />
      </Animated.View>
      <TouchableOpacity onPress={()=>{
        router.push("/auth/onBoarding/boardingFinal")
      }} activeOpacity={0.8} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Next</Text>
        <AntDesign name="arrowright" size={22} color="white" />
      </TouchableOpacity>
      <ExpoStatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor:"#e5cbcbff"
  },
  gradientBox: {
    width: 250,
    height: 250,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    fontSize: 28,
    fontWeight: 700,
    color: "black",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  subHeadingText: {
    fontSize: 18,
    fontWeight: 400,
    color: "#424141ff",
    marginTop: 30,
    paddingHorizontal: 20,
    textAlign: "center",
    lineHeight: 28,
  },
  bubbleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    // marginTop:20,
    flexDirection: "row",
  },
  bubble: {
    height: 15,
    width: 15,
    borderRadius: "50%",
    backgroundColor: "#bcbcbcff",
  },
  activeBubble: {
    height: 15,
    width: 15,
    borderRadius: "50%",
    backgroundColor: "#4184f8ff",
  },
  buttonContainer: {
    maxWidth: "85%",
    width: "100%",
    marginHorizontal: "auto",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#4184f8ff",
    marginVertical: 20,
    display: "flex",
    flexDirection: "row",
    gap: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 600,
    color: "white",
  },
});

export default BoardingTwo;
