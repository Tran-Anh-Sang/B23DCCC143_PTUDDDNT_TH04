/**
 * @param {React.ReactNode} children - Bắt buộc
 * @param {boolean} [scroll=false] - true thì nội dung nằm trong ScrollView
 * @param {boolean} [refreshing=false] - Chỉ dùng khi scroll = true
 * @param {() => void} [onRefresh] - Có thì cho phép kéo để làm mới (scroll = true)
 */
import React, {type ReactNode} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import OfflineBanner from './OfflineBanner';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenContainer({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <OfflineBanner />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  body: {flex: 1},
  scrollContent: {padding: spacing.lg, paddingBottom: spacing.xxl},
});
