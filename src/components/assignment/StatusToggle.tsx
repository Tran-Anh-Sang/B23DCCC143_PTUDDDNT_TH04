/**
 * @param {'todo'|'done'} status - Bắt buộc
 * @param {() => void} onToggle - Bắt buộc
 */
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import colors from '../../theme/colors';
import {MIN_TOUCH} from '../../theme/spacing';
import typography from '../../theme/typography';
import type {AssignmentStatus} from '../../types';

interface Props {
  status: AssignmentStatus;
  onToggle: () => void;
}

export default function StatusToggle({status, onToggle}: Props) {
  const done = status === 'done';
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{checked: done}}
      accessibilityLabel={done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
      style={styles.touch}>
      <View style={[styles.circle, done && styles.circleDone]}>
        <Text style={[styles.icon, done && styles.iconDone]}>{done ? '✓' : ''}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touch: {width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center'},
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {backgroundColor: colors.success, borderColor: colors.success},
  icon: {...typography.label, color: colors.textMuted},
  iconDone: {color: colors.white},
});
