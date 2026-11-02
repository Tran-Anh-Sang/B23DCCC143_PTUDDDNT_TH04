import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import {ROUTES, type HomeStackParamList} from './routes';
import stackOptions from './stackOptions';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name={ROUTES.Home} component={HomeScreen} options={{title: 'Tổng quan'}} />
      <Stack.Screen
        name={ROUTES.CourseDetail}
        component={CourseDetailScreen}
        options={{title: 'Chi tiết môn học'}}
      />
      <Stack.Screen
        name={ROUTES.AssignmentDetail}
        component={AssignmentDetailScreen}
        options={{title: 'Chi tiết bài tập'}}
      />
    </Stack.Navigator>
  );
}
