import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, ViewStyle } from 'react-native';
import { useColors } from '../../hooks/useColors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  error?: string;
  style?: ViewStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  autoFocus = false,
  error,
  style,
}: InputProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: error ? colors.danger : isFocused ? colors.borderFocused : colors.border,
            borderWidth: isFocused ? 2 : 1,
          },
          error && { backgroundColor: colors.dangerBackground },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    padding: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 44,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
