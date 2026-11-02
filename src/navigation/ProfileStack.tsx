import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import GradeListScreen from '../screens/profile/GradeListScreen';
import GradeDetailScreen from '../screens/profile/GradeDetailScreen';
import {ROUTES, type ProfileStackParamList} from './routes';
import stackOptions from './stackOptions';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name={ROUTES.Profile} component={ProfileScreen} options={{title: 'Cá nhân'}} />
      <Stack.Screen
        name={ROUTES.EditProfile}
        component={EditProfileScreen}
        options={{title: 'Chỉnh sửa thông tin'}}
      />
      <Stack.Screen
        name={ROUTES.GradeList}
        component={GradeListScreen}
        options={{title: 'Kết quả học tập'}}
      />
      <Stack.Screen
        name={ROUTES.GradeDetail}
        component={GradeDetailScreen}
        options={{title: 'Chi tiết kết quả'}}
      />
    </Stack.Navigator>
  );
}
