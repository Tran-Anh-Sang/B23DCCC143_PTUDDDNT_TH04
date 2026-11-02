/**
 * @param {Grade} grade - Bắt buộc (có kèm course)
 * @param {(grade: Grade) => void} onPress - Bắt buộc
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Badge from '../common/Badge';
import Card from '../common/Card';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type {Grade} from '../../types';

interface Props {
  grade: Grade;
  onPress: (grade: Grade) => void;
}

function GradeRow({grade, onPress}: Props) {
  const name = grade.course?.name ?? 'Môn học';
  const failed = grade.letter === 'F';
  return (
    <Card
      onPress={() => onPress(grade)}
      accessibilityLabel={`${name}, điểm tổng kết ${grade.total}, điểm chữ ${grade.letter}`}>
      <View style={styles.row}>
        <View style={styles.body}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sub}>{grade.course?.credits ?? '-'} tín chỉ</Text>
        </View>
        <View style={styles.score}>
          <Text style={styles.total}>{grade.total.toFixed(2)}</Text>
          <Badge label={grade.letter} tone={failed ? 'danger' : 'info'} />
        </View>
      </View>
    </Card>
  );
}

export default React.memo(GradeRow);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  body: {flex: 1},
  name: {...typography.bodyBold, color: colors.text},
  sub: {...typography.caption, color: colors.textMuted, marginTop: spacing.xs},
  score: {alignItems: 'flex-end'},
  total: {...typography.h3, color: colors.text, marginBottom: spacing.xs},
});
