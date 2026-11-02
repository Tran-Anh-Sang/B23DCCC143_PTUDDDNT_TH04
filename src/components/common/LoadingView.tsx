/**
 * @param {string} [message='Đang tải…']
 */
import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  message?: string;
}

export default function LoadingView({message = 'Đang tải…'}: Props) {
  return (
    <View style={styles.container} accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg},
  text: {...typography.body, color: colors.textMuted, marginTop: spacing.md},
});
