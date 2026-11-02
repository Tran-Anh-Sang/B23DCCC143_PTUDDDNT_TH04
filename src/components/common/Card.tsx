/**
 * @param {React.ReactNode} children - Bắt buộc
 * @param {() => void} [onPress] - Có thì thẻ có thể bấm
 * @param {string} [accessibilityLabel]
 */
import React, {type ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export default function Card({children, onPress, accessibilityLabel}: Props) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({pressed}) => [styles.card, styles.touch, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  touch: {minHeight: MIN_TOUCH},
  pressed: {opacity: 0.85},
});
