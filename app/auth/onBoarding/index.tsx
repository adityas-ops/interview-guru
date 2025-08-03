import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

const Index = () => {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslateY, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [containerOpacity, containerTranslateY]);

  return (
    <LinearGradient
      colors={["#4184f8ff", "rgba(53, 91, 161, 1)"]}
      style={styles.background}
    >
              <Animated.View
          style={[
            styles.container,
            {
              opacity: containerOpacity,
              transform: [{ translateY: containerTranslateY }],
            },
          ]}
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

        <Text style={styles.heading}>Al Interview Coach</Text>

        <Text style={styles.subHeading}>Master Your Next Interview</Text>

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
