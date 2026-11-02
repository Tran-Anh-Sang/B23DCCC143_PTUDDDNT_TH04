import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import colors from '../theme/colors';
import typography from '../theme/typography';

// Giao diện header dùng chung cho cả 5 Stack
const stackOptions: NativeStackNavigationOptions = {
  headerStyle: {backgroundColor: colors.surface},
  headerTintColor: colors.primary,
  headerTitleStyle: {...typography.h3, color: colors.text} as {
    fontSize: number;
    fontWeight: '700';
    color: string;
  },
  headerBackTitle: 'Quay lại',
  contentStyle: {backgroundColor: colors.background},
};

export default stackOptions;
