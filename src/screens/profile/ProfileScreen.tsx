import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import Card from '../../components/common/Card';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SectionTitle from '../../components/common/SectionTitle';
import SyncBadge from '../../components/common/SyncBadge';
import GpaSummary from '../../components/grade/GpaSummary';
import InfoRow from '../../components/profile/InfoRow';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import {ROUTES, type ProfileStackParamList} from '../../navigation/routes';
import spacing from '../../theme/spacing';
import {calcGpa} from '../../utils/gpa';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.Profile>;

export default function ProfileScreen({navigation}: Props) {
  const {student, courses, grades, status, studentPending, refreshAll} = useAppData();
  const {isOnline} = useSync();
  const summary = useMemo(() => calcGpa(grades, courses), [grades, courses]);

  if (!student) {
    return (
      <ScreenContainer>
        {status.student.error ? (
          <ErrorView message={status.student.error.message} onRetry={status.student.refresh} />
        ) : (
          <LoadingView />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scroll
      refreshing={status.student.refreshing || status.grades.refreshing}
      onRefresh={refreshAll}>
      <Card>
        <View style={styles.badge}>
          <SyncBadge pending={studentPending} />
        </View>
        <InfoRow label="Mã sinh viên" value={student.studentCode} />
        <InfoRow label="Họ tên" value={student.fullName} />
        <InfoRow label="Lớp" value={student.className} />
        <InfoRow label="Ngành" value={student.major} />
        <InfoRow label="Email" value={student.email} />
        <InfoRow label="Số điện thoại" value={student.phone} />
      </Card>
      <AppButton
        title="Chỉnh sửa thông tin"
        variant="outline"
        onPress={() => navigation.navigate(ROUTES.EditProfile)}
      />

      <SectionTitle title="Kết quả học tập" />
      <GpaSummary gpa={summary.gpa} totalCredits={summary.totalCredits} />
      <AppButton
        title="Xem điểm theo học kỳ"
        onPress={() => navigation.navigate(ROUTES.GradeList)}
      />
      {!isOnline ? <LastUpdatedText timestamp={status.student.lastUpdated} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badge: {marginBottom: spacing.sm},
});
