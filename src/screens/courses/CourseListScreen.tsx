import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SearchBar from '../../components/common/SearchBar';
import CourseCard from '../../components/course/CourseCard';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import {ROUTES, type CourseStackParamList} from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type {Course} from '../../types';
import {normalize, semesterRank} from '../../utils/date';

type Props = NativeStackScreenProps<CourseStackParamList, typeof ROUTES.CourseList>;

const ALL = 'all';

const keyExtractor = (item: Course) => String(item.id);

export default function CourseListScreen({navigation}: Props) {
  const {courses, status} = useAppData();
  const {isOnline} = useSync();
  const [query, setQuery] = useState('');
  const [semester, setSemester] = useState(ALL);

  const semesterOptions = useMemo(() => {
    const list = [...new Set(courses.map(c => c.semester))].sort(
      (a, b) => semesterRank(b) - semesterRank(a),
    );
    return [{value: ALL, label: 'Tất cả'}, ...list.map(s => ({value: s, label: s}))];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return courses.filter(
      c => (semester === ALL || c.semester === semester) && normalize(c.name).includes(q),
    );
  }, [courses, query, semester]);

  const openCourse = useCallback(
    (course: Course) => navigation.navigate(ROUTES.CourseDetail, {id: course.id}),
    [navigation],
  );
  const renderItem = useCallback(
    ({item}: {item: Course}) => <CourseCard course={item} onPress={openCourse} />,
    [openCourse],
  );

  const q = status.courses;
  if (courses.length === 0 && q.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }
  if (courses.length === 0 && q.error) {
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
        keyboardShouldPersistTaps="handled"
        refreshing={q.refreshing}
        onRefresh={q.refresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm môn học theo tên" />
            <View style={styles.chips}>
              <FilterChips options={semesterOptions} selected={semester} onSelect={setSemester} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Không tìm thấy môn học"
            description="Thử đổi từ khóa hoặc chọn học kỳ khác."
            actionLabel="Xóa bộ lọc"
            onAction={
              query || semester !== ALL
                ? () => {
                    setQuery('');
                    setSemester(ALL);
                  }
                : undefined
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
