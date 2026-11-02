/**
 * @param {number} [selectedDay] - 2 (Thứ 2) .. 8 (Chủ nhật); mặc định là hôm nay
 * @param {(day: number) => void} onSelectDay - Bắt buộc
 */
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';
import typography from '../../theme/typography';
import {DAY_KEYS, DAY_LABELS, DAY_SHORT, todayKey} from '../../utils/date';

interface Props {
  selectedDay?: number;
  onSelectDay: (day: number) => void;
}

export default function DaySelector({selectedDay = todayKey(), onSelectDay}: Props) {
  return (
    <View style={styles.row}>
      {DAY_KEYS.map(day => {
        const active = day === selectedDay;
        return (
          <Pressable
            key={day}
            onPress={() => onSelectDay(day)}
            accessibilityRole="button"
            accessibilityLabel={DAY_LABELS[day]}
            accessibilityState={{selected: active}}
            style={[styles.day, active && styles.dayActive]}>
            <Text style={[styles.text, active && styles.textActive]}>{DAY_SHORT[day]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  day: {
    flex: 1,
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH - spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  text: {...typography.label, color: colors.textMuted},
  textActive: {color: colors.white},
});
