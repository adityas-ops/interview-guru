import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

interface AnimateViewProps {
  children: React.ReactNode;
}

const AnimateView: React.FC<AnimateViewProps> = ({ children }) => {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const animation = Animated.parallel([
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
    ]);

    animation.start();

    // Cleanup function to stop animation when component unmounts
    return () => {
      animation.stop();
    };
  }, []); // Empty dependency array since we only want this to run once

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [{ translateY: containerTranslateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "white", 
  },
});

export default AnimateView;