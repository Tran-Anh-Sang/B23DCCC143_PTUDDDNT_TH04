import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AssignmentListScreen from '../screens/assignments/AssignmentListScreen';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import AssignmentFormScreen from '../screens/assignments/AssignmentFormScreen';
import {ROUTES, type AssignmentStackParamList} from './routes';
import stackOptions from './stackOptions';

const Stack = createNativeStackNavigator<AssignmentStackParamList>();

export default function AssignmentStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name={ROUTES.AssignmentList}
        component={AssignmentListScreen}
        options={{title: 'Bài tập'}}
      />
      <Stack.Screen
        name={ROUTES.AssignmentDetail}
        component={AssignmentDetailScreen}
        options={{title: 'Chi tiết bài tập'}}
      />
      <Stack.Screen
        name={ROUTES.AssignmentForm}
        component={AssignmentFormScreen}
        options={{title: 'Thêm bài tập'}}
      />
    </Stack.Navigator>
  );
}
