/**
 * @param {Course} course - Bắt buộc
 * @param {(course: Course) => void} onPress - Bắt buộc
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Card from '../common/Card';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type {Course} from '../../types';

interface Props {
  course: Course;
  onPress: (course: Course) => void;
}

function CourseCard({course, onPress}: Props) {
  return (
    <Card
      onPress={() => onPress(course)}
      accessibilityLabel={`Môn ${course.name}, ${course.credits} tín chỉ`}>
      <View style={styles.row}>
        <Text style={styles.code}>{course.code}</Text>
        <Text style={styles.credits}>{course.credits} tín chỉ</Text>
      </View>
      <Text style={styles.name}>{course.name}</Text>
      <Text style={styles.lecturer}>{course.lecturer}</Text>
    </Card>
  );
}

export default React.memo(CourseCard);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  code: {...typography.label, color: colors.primary},
  credits: {...typography.label, color: colors.textMuted},
  name: {...typography.h3, color: colors.text, marginTop: spacing.xs},
  lecturer: {...typography.body, color: colors.textMuted, marginTop: spacing.xs},
});
