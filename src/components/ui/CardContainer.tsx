// src/components/ui/CardContainer.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import theme from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface CardContainerProps {
  children: ReactNode;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  title,
  icon,
  style,
  contentStyle,
}) => {
  return (
    <Surface style={[styles.container, style]}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={20} color={theme.colors.primary} />
            </View>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s,
  },
  title: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  content: {
    padding: theme.spacing.m,
  },
});

export default CardContainer;