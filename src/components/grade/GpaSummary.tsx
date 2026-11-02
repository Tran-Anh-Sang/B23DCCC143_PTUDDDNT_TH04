/**
 * @param {number} gpa - Bắt buộc, GPA hệ 4 (làm tròn 2 chữ số khi hiển thị)
 * @param {number} totalCredits - Bắt buộc, tổng tín chỉ tích lũy
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '../../theme/colors';
import spacing, {radius} from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  gpa: number;
  totalCredits: number;
}

export default function GpaSummary({gpa, totalCredits}: Props) {
  return (
    <View style={styles.box} accessibilityLabel={`GPA ${gpa.toFixed(2)}, ${totalCredits} tín chỉ tích lũy`}>
      <View style={styles.cell}>
        <Text style={styles.value}>{gpa.toFixed(2)}</Text>
        <Text style={styles.label}>GPA (hệ 4)</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={styles.value}>{totalCredits}</Text>
        <Text style={styles.label}>Tín chỉ tích lũy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  cell: {flex: 1, alignItems: 'center'},
  divider: {width: 1, backgroundColor: colors.border},
  value: {...typography.h1, color: colors.primary},
  label: {...typography.caption, color: colors.textMuted, marginTop: spacing.xs},
});
