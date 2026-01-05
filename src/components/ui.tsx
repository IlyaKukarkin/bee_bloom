import React from 'react';
import { Pressable, Text as RNText, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../lib/theme';

export function Surface({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View style={[styles.surface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      {children}
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <RNText style={[styles.title, { color: theme.colors.text }]}>{children}</RNText>;
}

export function Body({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: TextStyle }) {
  const theme = useTheme();
  return <RNText style={[styles.body, { color: muted ? theme.colors.subtext : theme.colors.text }, style]}>{children}</RNText>;
}

export function Button({ children, onPress, disabled, style, variant = 'primary' }: { children: React.ReactNode; onPress: () => void; disabled?: boolean; style?: ViewStyle; variant?: 'primary' | 'secondary' }) {
  const theme = useTheme();
  const isSecondary = variant === 'secondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isSecondary ? theme.colors.warning : theme.colors.accent,
          opacity: pressed ? 0.85 : disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <RNText style={[styles.buttonText, { color: '#fff' }]}>{children}</RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
