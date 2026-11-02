import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Card from '../../components/common/Card';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import InfoRow from '../../components/profile/InfoRow';
import {useSync} from '../../context/SyncContext';
import useSessionDetail from '../../hooks/useSessionDetail';
import {ROUTES, type ScheduleStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import {DAY_LABELS} from '../../utils/date';

type Props = NativeStackScreenProps<ScheduleStackParamList, typeof ROUTES.SessionDetail>;

export default function SessionDetailScreen({navigation, route}: Props) {
  const detail = useSessionDetail(route.params.id);
  const {isOnline} = useSync();
  const session = detail.data;

  useEffect(() => {
    if (session?.course) {
      navigation.setOptions({title: session.course.name});
    }
  }, [navigation, session]);

  if (!session) {
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
        <Text style={styles.name}>{session.course?.name ?? 'Buổi học'}</Text>
        <InfoRow label="Ngày" value={DAY_LABELS[session.dayOfWeek] ?? '-'} />
        <InfoRow label="Thời gian" value={`${session.startTime} – ${session.endTime}`} />
        <InfoRow label="Phòng học" value={session.room} />
        <InfoRow label="Giảng viên" value={session.course?.lecturer ?? '-'} />
        <Text style={styles.noteLabel}>Ghi chú</Text>
        <Text style={styles.note}>{session.note || 'Không có ghi chú'}</Text>
      </Card>
      {!isOnline ? <LastUpdatedText timestamp={detail.lastUpdated} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: {...typography.h2, color: colors.text, marginBottom: spacing.sm},
  noteLabel: {...typography.label, color: colors.textMuted, marginTop: spacing.md},
  note: {...typography.body, color: colors.text, marginTop: spacing.xs},
});
