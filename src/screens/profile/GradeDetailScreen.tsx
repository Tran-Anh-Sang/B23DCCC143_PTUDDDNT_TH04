import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import InfoRow from '../../components/profile/InfoRow';
import {useSync} from '../../context/SyncContext';
import useGradeDetail from '../../hooks/useGradeDetail';
import {ROUTES, type ProfileStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import {toScale4} from '../../utils/gpa';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.GradeDetail>;

export default function GradeDetailScreen({navigation, route}: Props) {
  const detail = useGradeDetail(route.params.id);
  const {isOnline} = useSync();
  const grade = detail.data;

  useEffect(() => {
    if (grade?.course) {
      navigation.setOptions({title: grade.course.name});
    }
  }, [navigation, grade]);

  if (!grade) {
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
        <Text style={styles.name}>{grade.course?.name ?? 'Môn học'}</Text>
        <Text style={styles.sub}>
          {grade.semester} · {grade.course?.credits ?? '-'} tín chỉ
        </Text>
        <InfoRow label="Chuyên cần (10%)" value={String(grade.attendance)} />
        <InfoRow label="Giữa kỳ (30%)" value={String(grade.midterm)} />
        <InfoRow label="Cuối kỳ (60%)" value={String(grade.final)} />
        <InfoRow label="Tổng kết (hệ 10)" value={grade.total.toFixed(2)} />
        <InfoRow label="Điểm hệ 4" value={toScale4(grade.total).toFixed(1)} />
        <Text style={styles.letterLabel}>Điểm chữ</Text>
        <Badge label={grade.letter} tone={grade.letter === 'F' ? 'danger' : 'info'} />
      </Card>
      {!isOnline ? <LastUpdatedText timestamp={detail.lastUpdated} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: {...typography.h2, color: colors.text},
  sub: {...typography.body, color: colors.textMuted, marginVertical: spacing.xs},
  letterLabel: {...typography.label, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs},
});
