// src/components/ui/StylishInput.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import theme from '../../theme';

interface StylishInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}

const StylishInput: React.FC<StylishInputProps> = ({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  secureTextEntry = false,
  icon,
  multiline = false,
  keyboardType = 'default',
  style,
  inputStyle,
  autoCapitalize = 'none',
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  const borderColor = error 
    ? theme.colors.error 
    : isFocused 
      ? theme.colors.primary 
      : theme.colors.light;

  const labelColor = error 
    ? theme.colors.error 
    : isFocused 
      ? theme.colors.primary 
      : theme.colors.medium;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={[styles.inputContainer, { borderColor }]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? theme.colors.primary : theme.colors.medium} 
            style={styles.icon} 
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          placeholderTextColor={theme.colors.medium}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            style={styles.secureButton}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.medium}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.typography.fontSizes.s,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.white,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: theme.typography.fontSizes.m,
    color: theme.colors.black,
    paddingVertical: theme.spacing.s,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.m,
  },
  icon: {
    marginRight: theme.spacing.s,
  },
  secureButton: {
    padding: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.s,
    marginTop: theme.spacing.xs,
  },
});

export default StylishInput;