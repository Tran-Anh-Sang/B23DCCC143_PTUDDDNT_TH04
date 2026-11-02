import type {NavigatorScreenParams} from '@react-navigation/native';
import type {Id} from '../types';

// Tên màn hình khai báo một lần ở đây, không viết chuỗi trực tiếp khi gọi navigate
export const ROUTES = {
  // 5 tab
  HomeTab: 'HomeTab',
  CoursesTab: 'CoursesTab',
  ScheduleTab: 'ScheduleTab',
  AssignmentsTab: 'AssignmentsTab',
  ProfileTab: 'ProfileTab',
  // màn hình trong các Stack
  Home: 'Home',
  CourseList: 'CourseList',
  CourseDetail: 'CourseDetail',
  Schedule: 'Schedule',
  SessionDetail: 'SessionDetail',
  AssignmentList: 'AssignmentList',
  AssignmentDetail: 'AssignmentDetail',
  AssignmentForm: 'AssignmentForm',
  Profile: 'Profile',
  EditProfile: 'EditProfile',
  GradeList: 'GradeList',
  GradeDetail: 'GradeDetail',
} as const;

// Màn hình chi tiết chỉ nhận { id }
export type DetailParams = {id: Id};

export type HomeStackParamList = {
  [ROUTES.Home]: undefined;
  [ROUTES.CourseDetail]: DetailParams;
  [ROUTES.AssignmentDetail]: DetailParams;
};

export type CourseStackParamList = {
  [ROUTES.CourseList]: undefined;
  [ROUTES.CourseDetail]: DetailParams;
  [ROUTES.AssignmentDetail]: DetailParams;
};

export type ScheduleStackParamList = {
  [ROUTES.Schedule]: undefined;
  [ROUTES.SessionDetail]: DetailParams;
};

export type AssignmentStackParamList = {
  [ROUTES.AssignmentList]: undefined;
  [ROUTES.AssignmentDetail]: DetailParams;
  [ROUTES.AssignmentForm]: undefined;
};

export type ProfileStackParamList = {
  [ROUTES.Profile]: undefined;
  [ROUTES.EditProfile]: undefined;
  [ROUTES.GradeList]: undefined;
  [ROUTES.GradeDetail]: DetailParams;
};

export type RootTabParamList = {
  [ROUTES.HomeTab]: NavigatorScreenParams<HomeStackParamList>;
  [ROUTES.CoursesTab]: NavigatorScreenParams<CourseStackParamList>;
  [ROUTES.ScheduleTab]: NavigatorScreenParams<ScheduleStackParamList>;
  [ROUTES.AssignmentsTab]: NavigatorScreenParams<AssignmentStackParamList>;
  [ROUTES.ProfileTab]: NavigatorScreenParams<ProfileStackParamList>;
};
