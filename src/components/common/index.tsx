/**
 * Common UI Components
 * Shared components used across the application
 */

import React from 'react';
import {
  Text as RNText,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextProps,
  ViewProps,
  TouchableOpacityProps,
} from 'react-native';
import theme from '@theme';

/**
 * Typography Components
 */
export const Text: React.FC<TextProps & {variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption'}> = ({
  variant = 'body',
  style,
  ...props
}) => {
  const textStyle = [
    styles.text,
    variant === 'h1' && styles.h1,
    variant === 'h2' && styles.h2,
    variant === 'h3' && styles.h3,
    variant === 'caption' && styles.caption,
    style,
  ];
  return <RNText style={textStyle} {...props} />;
};

/**
 * Button Component
 */
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'outline' && styles.buttonTextOutline,
  ];

  return (
    <TouchableOpacity style={buttonStyle} disabled={disabled || loading} {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : '#fff'} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Card Component
 */
export const Card: React.FC<ViewProps> = ({style, children, ...props}) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

/**
 * Loading Spinner
 */
export const LoadingSpinner: React.FC<{size?: 'small' | 'large'}> = ({size = 'large'}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
    </View>
  );
};

/**
 * Error Message
 */
export const ErrorMessage: React.FC<{message: string}> = ({message}) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  h1: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  h2: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  h3: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // Button styles
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  buttonTextOutline: {
    color: theme.colors.primary,
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error styles
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
  },
});
