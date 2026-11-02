import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import CourseStack from './CourseStack';
import ScheduleStack from './ScheduleStack';
import AssignmentStack from './AssignmentStack';
import ProfileStack from './ProfileStack';
import Toast from '../components/common/Toast';
import {useAppData} from '../context/AppDataContext';
import {useSync} from '../context/SyncContext';
import colors from '../theme/colors';
import typography from '../theme/typography';
import {ROUTES, type RootTabParamList} from './routes';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, string> = {
  [ROUTES.HomeTab]: '🏠',
  [ROUTES.CoursesTab]: '📚',
  [ROUTES.ScheduleTab]: '🗓️',
  [ROUTES.AssignmentsTab]: '📝',
  [ROUTES.ProfileTab]: '👤',
};

export default function AppNavigator() {
  const {assignments} = useAppData();
  const {notice, clearNotice} = useSync();
  const todoCount = assignments.filter(a => a.status === 'todo').length;

  return (
    <View style={styles.root}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName={ROUTES.HomeTab}
          screenOptions={({route}) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: typography.caption,
            tabBarStyle: {backgroundColor: colors.surface},
            tabBarIcon: ({focused}) => (
              <Text style={[styles.icon, focused ? styles.iconOn : styles.iconOff]}>
                {ICONS[route.name]}
              </Text>
            ),
          })}>
          <Tab.Screen
            name={ROUTES.HomeTab}
            component={HomeStack}
            options={{tabBarLabel: 'Tổng quan'}}
          />
          <Tab.Screen
            name={ROUTES.CoursesTab}
            component={CourseStack}
            options={{tabBarLabel: 'Môn học'}}
          />
          <Tab.Screen
            name={ROUTES.ScheduleTab}
            component={ScheduleStack}
            options={{tabBarLabel: 'TKB'}}
          />
          <Tab.Screen
            name={ROUTES.AssignmentsTab}
            component={AssignmentStack}
            options={{
              tabBarLabel: 'Bài tập',
              tabBarBadge: todoCount > 0 ? todoCount : undefined,
            }}
          />
          <Tab.Screen
            name={ROUTES.ProfileTab}
            component={ProfileStack}
            options={{tabBarLabel: 'Cá nhân'}}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast message={notice} onHide={clearNotice} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  icon: {fontSize: 20},
  iconOn: {opacity: 1},
  iconOff: {opacity: 0.5},
});
