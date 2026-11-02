/**
 * @param {{value: string, label: string}[]} options - Bắt buộc
 * @param {string} selected - Bắt buộc, giá trị của chip đang chọn
 * @param {(value: string) => void} onSelect - Bắt buộc
 */
import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';
import typography from '../../theme/typography';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({options, selected, onSelect}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map(o => {
        const active = o.value === selected;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            accessibilityRole="button"
            accessibilityLabel={`Lọc ${o.label}`}
            accessibilityState={{selected: active}}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.text, active && styles.textActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {paddingVertical: spacing.xs},
  chip: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  text: {...typography.label, color: colors.textMuted},
  textActive: {color: colors.white},
});
