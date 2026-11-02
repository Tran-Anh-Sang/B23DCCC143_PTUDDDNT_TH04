import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import GpaSummary from '../../components/grade/GpaSummary';
import GradeRow from '../../components/grade/GradeRow';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import {ROUTES, type ProfileStackParamList} from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type {Grade} from '../../types';
import {semesterRank} from '../../utils/date';
import {calcGpa} from '../../utils/gpa';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.GradeList>;

const ALL = 'all';

const keyExtractor = (item: Grade) => String(item.id);

export default function GradeListScreen({navigation}: Props) {
  const {grades, courses, status} = useAppData();
  const {isOnline} = useSync();
  const [semester, setSemester] = useState(ALL);

  const options = useMemo(() => {
    const list = [...new Set(grades.map(g => g.semester))].sort(
      (a, b) => semesterRank(b) - semesterRank(a),
    );
    return [{value: ALL, label: 'Tất cả'}, ...list.map(s => ({value: s, label: s}))];
  }, [grades]);

  const filtered = useMemo(
    () => grades.filter(g => semester === ALL || g.semester === semester),
    [grades, semester],
  );
  const summary = useMemo(() => calcGpa(filtered, courses), [filtered, courses]);

  const openGrade = useCallback(
    (g: Grade) => navigation.navigate(ROUTES.GradeDetail, {id: g.id}),
    [navigation],
  );
  const renderItem = useCallback(
    ({item}: {item: Grade}) => <GradeRow grade={item} onPress={openGrade} />,
    [openGrade],
  );

  const q = status.grades;
  if (grades.length === 0 && q.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }
  if (grades.length === 0 && q.error) {
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
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={q.refreshing}
        onRefresh={q.refresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <FilterChips options={options} selected={semester} onSelect={setSemester} />
            <View style={styles.summary}>
              <GpaSummary gpa={summary.gpa} totalCredits={summary.totalCredits} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Chưa có điểm"
            description="Học kỳ này chưa có kết quả học tập."
          />
        }
        ListFooterComponent={!isOnline ? <LastUpdatedText timestamp={q.lastUpdated} /> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {padding: spacing.lg, flexGrow: 1},
  header: {marginBottom: spacing.sm},
  summary: {marginTop: spacing.md},
});
