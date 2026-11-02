import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import useToggleAssignment from '../../hooks/useToggleAssignment';
import {ROUTES, type AssignmentStackParamList} from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type {Assignment} from '../../types';
import {isOverdue} from '../../utils/date';

type Props = NativeStackScreenProps<AssignmentStackParamList, typeof ROUTES.AssignmentList>;

const FILTERS = [
  {value: 'all', label: 'Tất cả'},
  {value: 'todo', label: 'Chưa xong'},
  {value: 'done', label: 'Đã xong'},
  {value: 'overdue', label: 'Quá hạn'},
];

const keyExtractor = (item: Assignment) => String(item.id);

export default function AssignmentListScreen({navigation}: Props) {
  const {assignments, status, isAssignmentPending} = useAppData();
  const {isOnline} = useSync();
  const toggle = useToggleAssignment();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const list = assignments.filter(a => {
      if (filter === 'todo') return a.status === 'todo';
      if (filter === 'done') return a.status === 'done';
      if (filter === 'overdue') return isOverdue(a.dueDate, a.status);
      return true;
    });
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments, filter]);

  const openAssignment = useCallback(
    (a: Assignment) => navigation.navigate(ROUTES.AssignmentDetail, {id: a.id}),
    [navigation],
  );
  const toggleStatus = useCallback((a: Assignment) => toggle(a.id), [toggle]);
  const openForm = useCallback(() => navigation.navigate(ROUTES.AssignmentForm), [navigation]);

  const renderItem = useCallback(
    ({item}: {item: Assignment}) => (
      <AssignmentItem
        assignment={item}
        pending={isAssignmentPending(item.id)}
        onPress={openAssignment}
        onToggleStatus={toggleStatus}
      />
    ),
    [isAssignmentPending, openAssignment, toggleStatus],
  );

  const q = status.assignments;
  if (assignments.length === 0 && q.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }
  if (assignments.length === 0 && q.error) {
    return (
      <ScreenContainer>
        <ErrorView message={q.error.message} onRetry={q.refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={filtered}
        extraData={isAssignmentPending}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={q.refreshing}
        onRefresh={q.refresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppButton title="＋ Thêm bài tập" onPress={openForm} accessibilityLabel="Thêm bài tập mới" />
            <View style={styles.chips}>
              <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Không có bài tập"
            description={
              filter === 'all'
                ? 'Bấm "Thêm bài tập" để tạo bài tập đầu tiên.'
                : 'Không có bài tập nào khớp bộ lọc này.'
            }
          />
        }
        ListFooterComponent={!isOnline ? <LastUpdatedText timestamp={q.lastUpdated} /> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {padding: spacing.lg, flexGrow: 1},
  header: {marginBottom: spacing.md},
  chips: {marginTop: spacing.sm},
});
