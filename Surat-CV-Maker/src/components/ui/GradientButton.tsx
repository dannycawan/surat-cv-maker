// src/components/ui/GradientButton.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: [string, string];
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradient = [theme.colors.gradientStart, theme.colors.gradientEnd],
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? [theme.colors.light, theme.colors.light] : gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} size="small" />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: theme.typography.fontSizes.m,
  },
  disabledText: {
    color: theme.colors.medium,
  },
  iconContainer: {
    marginRight: theme.spacing.s,
  },
});

export default GradientButton;