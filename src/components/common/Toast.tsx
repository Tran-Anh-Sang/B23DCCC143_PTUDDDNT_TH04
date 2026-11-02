/**
 * @param {string | null} message - Bắt buộc. null thì không hiện
 * @param {() => void} onHide - Bắt buộc, gọi khi hết thời gian hoặc người dùng chạm vào
 * @param {number} [duration=5000]
 */
import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  message: string | null;
  onHide: () => void;
  duration?: number;
}

export default function Toast({message, onHide, duration = 5000}: Props) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onHide]);

  if (!message) {
    return null;
  }
  return (
    <SafeAreaView edges={['top']} style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onHide}
        accessibilityRole="alert"
        accessibilityLabel={message}
        style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg},
  toast: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    backgroundColor: colors.text,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  text: {...typography.body, color: colors.white},
});
