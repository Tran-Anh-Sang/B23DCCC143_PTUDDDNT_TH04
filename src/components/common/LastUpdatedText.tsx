/**
 * @param {string | null} [timestamp] - Thời điểm lưu cache (ISO). Rỗng thì không hiện gì
 */
import React from 'react';
import {StyleSheet, Text} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import {formatTimestamp} from '../../utils/date';

interface Props {
  timestamp?: string | null;
}

export default function LastUpdatedText({timestamp = null}: Props) {
  if (!timestamp) {
    return null;
  }
  return <Text style={styles.text}>Cập nhật lần cuối: {formatTimestamp(timestamp)}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
