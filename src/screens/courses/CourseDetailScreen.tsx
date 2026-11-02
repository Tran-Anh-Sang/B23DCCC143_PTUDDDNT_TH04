import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SectionTitle from '../../components/common/SectionTitle';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import InfoRow from '../../components/profile/InfoRow';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import useCourseDetail from '../../hooks/useCourseDetail';
import useSessions from '../../hooks/useSessions';
import useToggleAssignment from '../../hooks/useToggleAssignment';
import {ROUTES, type CourseStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type {Assignment} from '../../types';
import {DAY_LABELS} from '../../utils/date';

type Props = NativeStackScreenProps<CourseStackParamList, typeof ROUTES.CourseDetail>;

export default function CourseDetailScreen({navigation, route}: Props) {
  const {id} = route.params;
  const detail = useCourseDetail(id);
  const sessionsQ = useSessions();
  const {assignments, isAssignmentPending} = useAppData();
  const {isOnline} = useSync();
  const toggle = useToggleAssignment();
  const course = detail.data;

  useEffect(() => {
    if (course) {
      navigation.setOptions({title: course.name});
    }
  }, [navigation, course]);

  const sessions = useMemo(
    () =>
      (sessionsQ.data ?? [])
        .filter(s => String(s.courseId) === String(id))
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)),
    [sessionsQ.data, id],
  );
  const courseAssignments = useMemo(
    () => assignments.filter(a => String(a.courseId) === String(id)),
    [assignments, id],
  );

  const openAssignment = useCallback(
    (a: Assignment) => navigation.navigate(ROUTES.AssignmentDetail, {id: a.id}),
    [navigation],
  );
  const toggleStatus = useCallback((a: Assignment) => toggle(a.id), [toggle]);

  if (!course) {
    return (
      <ScreenContainer>
        {detail.error ? (
          <ErrorView message={detail.error.message} onRetry={detail.refresh} />
        ) : (
          <LoadingView />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll refreshing={detail.refreshing} onRefresh={detail.refresh}>
      <Card>
        <Text style={styles.code}>{course.code}</Text>
        <Text style={styles.name}>{course.name}</Text>
        <InfoRow label="Số tín chỉ" value={String(course.credits)} />
        <InfoRow label="Giảng viên" value={course.lecturer} />
        <InfoRow label="Học kỳ" value={course.semester} />
        <Text style={styles.desc}>{course.description}</Text>
      </Card>

      <SectionTitle title="Lịch học" />
      {sessions.length === 0 ? (
        <EmptyState title="Chưa có lịch học" />
      ) : (
        sessions.map(s => (
          <Card key={s.id}>
            <Text style={styles.session}>
              {DAY_LABELS[s.dayOfWeek]} · {s.startTime} – {s.endTime}
            </Text>
            <Text style={styles.sessionSub}>Phòng {s.room}</Text>
          </Card>
        ))
      )}

      <SectionTitle title="Bài tập" />
      {courseAssignments.length === 0 ? (
        <EmptyState title="Môn này chưa có bài tập" />
      ) : (
        courseAssignments.map(a => (
          <AssignmentItem
            key={String(a.id)}
            assignment={a}
            pending={isAssignmentPending(a.id)}
            onPress={openAssignment}
            onToggleStatus={toggleStatus}
          />
        ))
      )}

      {!isOnline ? <LastUpdatedText timestamp={detail.lastUpdated} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  code: {...typography.label, color: colors.primary},
  name: {...typography.h2, color: colors.text, marginVertical: spacing.xs},
  desc: {...typography.body, color: colors.text, marginTop: spacing.md},
  session: {...typography.bodyBold, color: colors.text},
  sessionSub: {...typography.body, color: colors.textMuted, marginTop: spacing.xs},
});
