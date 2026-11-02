import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CourseListScreen from '../screens/courses/CourseListScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import {ROUTES, type CourseStackParamList} from './routes';
import stackOptions from './stackOptions';

const Stack = createNativeStackNavigator<CourseStackParamList>();

export default function CourseStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name={ROUTES.CourseList}
        component={CourseListScreen}
        options={{title: 'Môn học'}}
      />
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
