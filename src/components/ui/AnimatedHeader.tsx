// src/components/ui/AnimatedHeader.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

interface AnimatedHeaderProps {
  title: string;
  scrollY: Animated.Value;
  maxHeight?: number;
  minHeight?: number;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  scrollY,
  maxHeight = 180,
  minHeight = 60,
}) => {
  const insets = useSafeAreaInsets();
  
  // Calculate header height
  const headerHeight = scrollY.interpolate({
    inputRange: [0, maxHeight - minHeight],
    outputRange: [maxHeight, minHeight],
    extrapolate: 'clamp',
  });

  // Calculate title opacity for large header
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, (maxHeight - minHeight) * 0.5, maxHeight - minHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Calculate small title opacity
  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [0, (maxHeight - minHeight) * 0.7, maxHeight - minHeight],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // Calculate title position
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, maxHeight - minHeight],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // Calculate title scale
  const titleScale = scrollY.interpolate({
    inputRange: [0, maxHeight - minHeight],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { height: headerHeight }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Small title that appears when scrolling */}
        <Animated.Text 
          style={[
            styles.smallTitle,
            { opacity: smallTitleOpacity }
          ]}
        >
          {title}
        </Animated.Text>
        
        {/* Large title that fades out when scrolling */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [
                { translateY: titleTranslateY },
                { scale: titleScale }
              ]
            }
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <View style={styles.titleLine} />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'space-between',
  },
  titleContainer: {
    position: 'absolute',
    bottom: theme.spacing.l,
    left: theme.spacing.l,
    right: theme.spacing.l,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  titleLine: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.s,
  },
  smallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    position: 'absolute',
    bottom: theme.spacing.s,
    left: theme.spacing.l,
  },
});

export default AnimatedHeader;