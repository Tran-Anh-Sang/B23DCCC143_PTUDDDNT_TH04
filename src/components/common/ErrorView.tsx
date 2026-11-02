/**
 * @param {string} message - Bắt buộc
 * @param {() => void} onRetry - Bắt buộc
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppButton from './AppButton';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorView({message, onRetry}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Đã xảy ra lỗi</Text>
      <Text style={styles.message}>{message}</Text>
      <AppButton title="Thử lại" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  icon: {...typography.h1, marginBottom: spacing.sm},
  title: {...typography.h3, color: colors.danger},
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
