import React, {useCallback, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SyncBadge from '../../components/common/SyncBadge';
import InfoRow from '../../components/profile/InfoRow';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import useAssignmentDetail from '../../hooks/useAssignmentDetail';
import useToggleAssignment from '../../hooks/useToggleAssignment';
import {ROUTES, type AssignmentStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import {formatDateTime, isOverdue} from '../../utils/date';

type Props = NativeStackScreenProps<AssignmentStackParamList, typeof ROUTES.AssignmentDetail>;

export default function AssignmentDetailScreen({navigation, route}: Props) {
  const {id} = route.params;
  const detail = useAssignmentDetail(id);
  const {assignments, isAssignmentPending} = useAppData();
  const {isOnline} = useSync();
  const toggle = useToggleAssignment();

  // Trạng thái hiện hành (đã gồm thay đổi chưa đồng bộ) lấy từ Context
  const live = assignments.find(a => String(a.id) === String(id));
  const item = live ?? detail.data;

  useEffect(() => {
    if (item) {
      navigation.setOptions({title: item.title});
    }
  }, [navigation, item]);

  const onToggle = useCallback(() => toggle(id), [toggle, id]);

  if (!item) {
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

  const done = item.status === 'done';
  const overdue = isOverdue(item.dueDate, item.status);

  return (
    <ScreenContainer scroll refreshing={detail.refreshing} onRefresh={detail.refresh}>
      <Card>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.badges}>
          <Badge
            label={done ? 'Đã xong' : overdue ? 'Quá hạn' : 'Chưa xong'}
            tone={done ? 'success' : overdue ? 'danger' : 'info'}
          />
          <SyncBadge pending={isAssignmentPending(item.id)} />
        </View>
        <InfoRow label="Môn học" value={item.course?.name ?? '-'} />
        <InfoRow label="Hạn nộp" value={formatDateTime(item.dueDate)} />
        <Text style={styles.label}>Mô tả</Text>
        <Text style={styles.desc}>{item.description || 'Không có mô tả'}</Text>
      </Card>
      <AppButton
        title={done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
        onPress={onToggle}
        variant={done ? 'outline' : 'primary'}
      />
      {!isOnline ? <LastUpdatedText timestamp={detail.lastUpdated} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {...typography.h2, color: colors.text},
  badges: {flexDirection: 'row', marginVertical: spacing.sm},
  label: {...typography.label, color: colors.textMuted, marginTop: spacing.md},
  desc: {...typography.body, color: colors.text, marginTop: spacing.xs},
});
