/**
 * @param {string} label - Bắt buộc
 * @param {string} value - Bắt buộc
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  label: string;
  value: string;
}

export default function InfoRow({label, value}: Props) {
  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {...typography.body, color: colors.textMuted},
  value: {...typography.bodyBold, color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: spacing.md},
});
