import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

// Type definitions
interface AvatarProps {
  name: string;
  size?: number;
  textColor?: string;
  fallbackIcon?: string;
}

interface Styles {
  avatar: ViewStyle;
  fallbackAvatar: ViewStyle;
  text: TextStyle;
}

// Type for gradient color pairs
type GradientColors = [string, string];

// Dark and subtle gradient combinations - shuffled for variety
const gradients: GradientColors[] = [
  ['#434343', '#000000'],   // Dark gray to black
  ['#1f4037', '#99f2c8'],   // Dark forest to mint
  ['#355c7d', '#6c5b7b'],   // Steel blue to muted purple
  ['#2c3e50', '#4ca1af'],   // Dark navy to teal
  ['#232526', '#414345'],   // Charcoal gradients
  ['#000428', '#004e92'],   // Midnight to ocean blue
  ['#2b5876', '#4e4376'],   // Deep blue to purple
  ['#0f2027', '#203a43'],   // Dark slate to blue-gray
  ['#3a1c71', '#d76d77'],   // Deep purple to dusty rose
  ['#283e51', '#485563'],   // Storm blue to steel
  ['#16222a', '#3a6073'],   // Charcoal to steel blue
  ['#232526', '#1c1c1c'],   // Dark grays
  ['#1e3c72', '#2a5298'],   // Navy to royal blue
  ['#000000', '#434343'],   // Black to gray
  ['#134e5e', '#71b280'],   // Dark teal to sage
  ['#2c3e50', '#2980b9'],   // Midnight to azure
  ['#1c1c1c', '#505050'],   // Subtle dark grays
  ['#0f3460', '#0575e6'],   // Deep navy to bright blue
  ['#200122', '#6f0000'],   // Dark wine to burgundy
  ['#4b6cb7', '#182848'],   // Blue to dark navy
  ['#360033', '#0b8793'],   // Deep purple to teal
  ['#000000', '#2c3e50'],   // Black to navy
  ['#232526', '#2c3e50'],   // Gray to navy
  ['#1a2a6c', '#b21f1f'],   // Navy to deep red
  ['#0c0c0c', '#3d3d3d'],   // Near black to dark gray
  ['#2c5364', '#203a43'],   // Teal to slate
];

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 64,
  textColor = '#ffffff',
  fallbackIcon = '?' 
}) => {

  // Use a consistent but shuffled version based on the name
  const getConsistentGradient = (input: string): GradientColors => {
    // Create a simple hash from the name to ensure consistency
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  if (!name || name.trim() === '') {
    return (
      <View 
        style={[
          styles.fallbackAvatar, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2 
          } as ViewStyle
        ]}
      >
        <Text style={[
          styles.text, 
          { 
            fontSize: size * 0.4,
            color: textColor 
          } as TextStyle
        ]}>
          {fallbackIcon}
        </Text>
      </View>
    );
  }

  // Get first letter and convert to uppercase
  const firstLetter: string = name.trim().charAt(0).toUpperCase();
  
  // Get consistent gradient for this name
  const gradientColors: GradientColors = getConsistentGradient(name.trim());

  return (
    <LinearGradient
      colors={gradientColors}
      style={[
        styles.avatar, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2 
        } as ViewStyle
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[
        styles.text, 
        { 
          fontSize: size * 0.4,
          color: textColor 
        } as TextStyle
      ]}>
        {firstLetter}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create<Styles>({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fallbackAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Avatar;
