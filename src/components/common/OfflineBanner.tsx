import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

// Ngoại lệ duy nhất trong components/ được dùng hook: tự đọc trạng thái mạng
export default function OfflineBanner() {
  const {isOnline} = useNetworkStatus();
  if (isOnline) {
    return null;
  }
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLabel="Bạn đang offline">
      <Text style={styles.text}>Bạn đang offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.offline,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  text: {...typography.label, color: colors.white},
});
