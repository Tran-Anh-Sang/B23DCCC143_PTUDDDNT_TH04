/**
 * @param {Assignment} assignment - Bắt buộc
 * @param {boolean} [pending=false] - Có thay đổi chưa đồng bộ
 * @param {(assignment: Assignment) => void} onPress - Bắt buộc
 * @param {(assignment: Assignment) => void} onToggleStatus - Bắt buộc
 */
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Card from '../common/Card';
import SyncBadge from '../common/SyncBadge';
import StatusToggle from './StatusToggle';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH} from '../../theme/spacing';
import typography from '../../theme/typography';
import type {Assignment} from '../../types';
import {formatDateTime, isOverdue} from '../../utils/date';

interface Props {
  assignment: Assignment;
  pending?: boolean;
  onPress: (assignment: Assignment) => void;
  onToggleStatus: (assignment: Assignment) => void;
}

function AssignmentItem({assignment, pending = false, onPress, onToggleStatus}: Props) {
  const overdue = isOverdue(assignment.dueDate, assignment.status);
  const done = assignment.status === 'done';
  return (
    <Card>
      <View style={styles.row}>
        <StatusToggle status={assignment.status} onToggle={() => onToggleStatus(assignment)} />
        <Pressable
          style={styles.body}
          onPress={() => onPress(assignment)}
          accessibilityRole="button"
          accessibilityLabel={`Bài tập ${assignment.title}`}>
          <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
            {assignment.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {assignment.course?.name ?? ''}
          </Text>
          <Text style={[styles.sub, overdue && styles.overdue]}>
            Hạn nộp: {formatDateTime(assignment.dueDate)}
            {overdue ? ' (quá hạn)' : ''}
          </Text>
          <View style={styles.badge}>
            <SyncBadge pending={pending} />
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

export default React.memo(AssignmentItem);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-start'},
  body: {flex: 1, minHeight: MIN_TOUCH, paddingVertical: spacing.sm},
  title: {...typography.bodyBold, color: colors.text},
  titleDone: {textDecorationLine: 'line-through', color: colors.textMuted},
  sub: {...typography.caption, color: colors.textMuted, marginTop: spacing.xs},
  overdue: {color: colors.danger, fontWeight: '700'},
  badge: {marginTop: spacing.xs},
});
