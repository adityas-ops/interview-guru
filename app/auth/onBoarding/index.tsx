import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const Index = () => {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageTranslateY = useRef(new Animated.Value(10)).current;
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslateY = useRef(new Animated.Value(10)).current;
  const subHeadingOpacity = useRef(new Animated.Value(0)).current;
  const subHeadingTranslateY = useRef(new Animated.Value(10)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Animate image first
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate heading after image
      Animated.parallel([
        Animated.timing(headingOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headingTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animate subheading after heading
        Animated.parallel([
          Animated.timing(subHeadingOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(subHeadingTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Animate button last
          Animated.parallel([
            Animated.timing(buttonOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(buttonTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    });
  }, []);

  return (
    <LinearGradient
      colors={["#4184f8ff", "rgba(53, 91, 161, 1)"]}
      style={styles.background}
    >
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: imageOpacity,
            transform: [{ translateY: imageTranslateY }],
          }}
        >
          <Image
            source={require("@/assets/images/intervewguru-logo.png")}
            style={{
              height: 120,
              width: 120,
              borderRadius: 25,
            }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: headingOpacity,
            transform: [{ translateY: headingTranslateY }],
          }}
        >
          <Text style={styles.heading}>Al Interview Coach</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: subHeadingOpacity,
            transform: [{ translateY: subHeadingTranslateY }],
          }}
        >
          <Text style={styles.subHeading}>Master Your Next Interview</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push("/auth/onBoarding/boardingOne");
            }}
            activeOpacity={0.8}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <ExpoStatusBar style="light" />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
  },
  heading: {
    fontSize: 32,
    fontWeight: 800,
    color: "white",
    marginTop: 35,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 500,
    color: "#e9e2e2ff",
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 55,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 600,
    color: "rgba(65, 132, 248, 1)",
  },
});

export default Index;
