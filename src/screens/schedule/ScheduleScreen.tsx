import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import DaySelector from '../../components/schedule/DaySelector';
import SessionCard from '../../components/schedule/SessionCard';
import {useSync} from '../../context/SyncContext';
import useSessions from '../../hooks/useSessions';
import {ROUTES, type ScheduleStackParamList} from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type {Session} from '../../types';
import {DAY_LABELS, todayKey} from '../../utils/date';

type Props = NativeStackScreenProps<ScheduleStackParamList, typeof ROUTES.Schedule>;

const keyExtractor = (item: Session) => String(item.id);

export default function ScheduleScreen({navigation}: Props) {
  const q = useSessions();
  const {isOnline} = useSync();
  const [day, setDay] = useState(todayKey());

  const sessions = useMemo(
    () =>
      (q.data ?? [])
        .filter(s => s.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [q.data, day],
  );

  const openSession = useCallback(
    (session: Session) => navigation.navigate(ROUTES.SessionDetail, {id: session.id}),
    [navigation],
  );
  const renderItem = useCallback(
    ({item}: {item: Session}) => <SessionCard session={item} onPress={openSession} />,
    [openSession],
  );

  if (q.data === null && q.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }
  if (q.data === null && q.error) {
    return (
      <ScreenContainer>
        <ErrorView message={q.error.message} onRetry={q.refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={sessions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={q.refreshing}
        onRefresh={q.refresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <DaySelector selectedDay={day} onSelectDay={setDay} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={`${DAY_LABELS[day]} không có buổi học`}
            description="Chọn ngày khác để xem lịch."
          />
        }
        ListFooterComponent={!isOnline ? <LastUpdatedText timestamp={q.lastUpdated} /> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {padding: spacing.lg, flexGrow: 1},
  header: {marginBottom: spacing.lg},
});
