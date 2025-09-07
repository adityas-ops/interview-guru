import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Loader = () => {
  const butterflyPosition = useRef(new Animated.ValueXY({ x: 200, y: 200 })).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Getting things ready...",
    "Almost there...",
    "Loading your experience...",
    "Just a moment...",
    "Preparing something special...",
    "Setting up your world...",
    "Making magic happen...",
    "Gathering resources..."
  ];

  const animateButterfly = () => {
    const randomX = Math.random() * (screenWidth - 100);
    const randomY = Math.random() * (screenHeight/2.3 - 100);
    const duration = 2000 + Math.random() * 3000;

    Animated.timing(butterflyPosition, {
      toValue: { x: randomX, y: randomY },
      duration: duration,
      useNativeDriver: false,
    }).start(() => {
      animateButterfly();
    });
  };

  const animateText = () => {
    Animated.sequence([
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateButterfly();
    
    // Change text every 2 seconds
    const textInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      animateText();
    }, 2000);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Butterfly with animated position */}
      <Animated.View
        style={[
          styles.butterflyContainer,
          {
            transform: [
              { translateX: butterflyPosition.x },
              { translateY: butterflyPosition.y }
            ]
          }
        ]}
      >
        <LottieView
          autoPlay
          loop
          style={styles.butterFly}
          source={require('@/assets/images/butterfly.json')}
        />
      </Animated.View>

      {/* Static loader cat */}
      <LottieView
        autoPlay
        loop
        style={styles.loaderCat}
        source={require('@/assets/images/loader_cat.json')}
      />

      {/* Loading text */}
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.loadingText, { opacity: textFadeAnim }]}>
          {loadingMessages[currentMessageIndex]}
        </Animated.Text>
        
        {/* Loading dots animation */}
        <LoadingDots />
      </View>
    </View>
  );
};

// Animated loading dots component
const LoadingDots = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dot1Anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ]).start(() => animateDots());
    };
    animateDots();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.Text style={[styles.dot, { opacity: dot1Anim }]}>●</Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: dot2Anim }]}>●</Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: dot3Anim }]}>●</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f0f8ff'
  },
  butterflyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  loaderCat: {
    width: 350,
    height: 350,
  },
  butterFly: {
    width: 80,
    height: 80
  },
  textContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    fontSize: 20,
    color: '#4a5568',
    marginHorizontal: 2,
  },
});

export default Loader;
