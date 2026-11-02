/**
 * @param {string} title - Bắt buộc
 * @param {() => void} onPress - Bắt buộc
 * @param {'primary'|'outline'} [variant='primary']
 * @param {boolean} [loading=false] - Hiện spinner và không cho bấm
 * @param {boolean} [disabled=false]
 * @param {string} [accessibilityLabel] - Mặc định lấy theo title
 */
import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const outline = variant === 'outline';
  const blocked = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{disabled: blocked, busy: loading}}
      style={({pressed}) => [
        styles.button,
        outline ? styles.outline : styles.primary,
        blocked && styles.blocked,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, outline ? styles.textOutline : styles.textPrimary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {backgroundColor: colors.primary},
  outline: {backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary},
  blocked: {opacity: 0.5},
  pressed: {opacity: 0.85},
  text: {...typography.bodyBold},
  textPrimary: {color: colors.white},
  textOutline: {color: colors.primary},
});
