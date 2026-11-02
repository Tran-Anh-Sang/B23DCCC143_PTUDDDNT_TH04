import React, {useCallback, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SectionTitle from '../../components/common/SectionTitle';
import SyncBadge from '../../components/common/SyncBadge';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import CourseCard from '../../components/course/CourseCard';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import useToggleAssignment from '../../hooks/useToggleAssignment';
import {ROUTES, type HomeStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type {Assignment, Course} from '../../types';
import {daysLeft, isOverdue, semesterRank} from '../../utils/date';

type Props = NativeStackScreenProps<HomeStackParamList, typeof ROUTES.Home>;

export default function HomeScreen({navigation}: Props) {
  const {student, courses, assignments, status, studentPending, isAssignmentPending, refreshAll} =
    useAppData();
  const {isOnline, pendingCount, syncing, syncNow} = useSync();
  const toggle = useToggleAssignment();

  // Môn đang học = các môn của học kỳ mới nhất
  const currentCourses = useMemo(() => {
    const latest = Math.max(0, ...courses.map(c => semesterRank(c.semester)));
    return courses.filter(c => semesterRank(c.semester) === latest);
  }, [courses]);

  // Bài tập chưa xong, hạn nộp trong 7 ngày tới
  const upcoming = useMemo(
    () =>
      assignments
        .filter(
          a =>
            a.status === 'todo' &&
            !isOverdue(a.dueDate, a.status) &&
            daysLeft(a.dueDate) <= 7,
        )
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [assignments],
  );

  const openCourse = useCallback(
    (course: Course) => navigation.navigate(ROUTES.CourseDetail, {id: course.id}),
    [navigation],
  );
  const openAssignment = useCallback(
    (a: Assignment) => navigation.navigate(ROUTES.AssignmentDetail, {id: a.id}),
    [navigation],
  );
  const toggleStatus = useCallback((a: Assignment) => toggle(a.id), [toggle]);

  if (!student) {
    return (
      <ScreenContainer>
        {status.student.error ? (
          <ErrorView message={status.student.error.message} onRetry={refreshAll} />
        ) : (
          <LoadingView />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scroll
      refreshing={status.student.refreshing || status.assignments.refreshing}
      onRefresh={refreshAll}>
      <Card>
        <Text style={styles.name}>{student.fullName}</Text>
        <Text style={styles.sub}>Mã sinh viên: {student.studentCode}</Text>
        <Text style={styles.sub}>
          {student.className} · {student.major}
        </Text>
        <View style={styles.badge}>
          <SyncBadge pending={studentPending} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sync}>
          {pendingCount > 0
            ? `${pendingCount} thay đổi chưa đồng bộ`
            : 'Mọi thay đổi đã được đồng bộ'}
        </Text>
        {pendingCount > 0 && isOnline ? (
          <AppButton title="Đồng bộ ngay" onPress={syncNow} loading={syncing} variant="outline" />
        ) : null}
      </Card>

      <SectionTitle title={`Môn đang học (${currentCourses.length})`} />
      {currentCourses.length === 0 ? (
        <EmptyState
          title={status.courses.error ? 'Không tải được danh sách môn' : 'Chưa có môn đang học'}
          description={status.courses.error?.message}
          onAction={status.courses.error ? status.courses.refresh : undefined}
        />
      ) : (
        currentCourses.map(course => (
          <CourseCard key={course.id} course={course} onPress={openCourse} />
        ))
      )}

      <SectionTitle title="Bài tập đến hạn trong 7 ngày tới" />
      {upcoming.length === 0 ? (
        <EmptyState
          title={status.assignments.error ? 'Không tải được bài tập' : 'Không có bài tập sắp đến hạn'}
          description={status.assignments.error?.message ?? 'Bạn có thể nghỉ ngơi một chút.'}
          onAction={status.assignments.error ? status.assignments.refresh : undefined}
        />
      ) : (
        upcoming.map(a => (
          <AssignmentItem
            key={String(a.id)}
            assignment={a}
            pending={isAssignmentPending(a.id)}
            onPress={openAssignment}
            onToggleStatus={toggleStatus}
          />
        ))
      )}

      {!isOnline ? <LastUpdatedText timestamp={status.assignments.lastUpdated} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: {...typography.h2, color: colors.text},
  sub: {...typography.body, color: colors.textMuted, marginTop: spacing.xs},
  badge: {marginTop: spacing.sm},
  sync: {...typography.bodyBold, color: colors.text, marginBottom: spacing.sm},
});
