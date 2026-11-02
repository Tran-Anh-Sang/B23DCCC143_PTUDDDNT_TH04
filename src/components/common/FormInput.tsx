/**
 * @param {string} label - Bắt buộc
 * @param {string} value - Bắt buộc
 * @param {(text: string) => void} onChangeText - Bắt buộc
 * @param {string} [error] - Hiện màu đỏ bên dưới ô nhập
 * @param {KeyboardTypeOptions} [keyboardType='default']
 * @param {string} [placeholder]
 * @param {boolean} [multiline=false]
 * @param {boolean} [editable=true]
 */
import React from 'react';
import {StyleSheet, Text, TextInput, View, type KeyboardTypeOptions} from 'react-native';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  error = '',
  keyboardType = 'default',
  placeholder = '',
  multiline = false,
  editable = true,
}: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, !!error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        editable={editable}
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {marginBottom: spacing.lg},
  label: {...typography.label, color: colors.text, marginBottom: spacing.xs},
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    ...typography.body,
  },
  multiline: {minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md},
  inputError: {borderColor: colors.danger},
  error: {...typography.caption, color: colors.danger, marginTop: spacing.xs},
});
