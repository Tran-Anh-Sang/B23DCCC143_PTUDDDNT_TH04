// Kiểu dữ liệu dùng chung cho toàn ứng dụng
export type Id = number | string;

export interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  className: string;
  major: string;
  email: string;
  phone: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  lecturer: string;
  description: string;
  semester: string;
}

export interface Session {
  id: number;
  courseId: number;
  dayOfWeek: number; // 2 (Thứ 2) .. 8 (Chủ nhật)
  startTime: string;
  endTime: string;
  room: string;
  note: string;
  course?: Course;
}

export type AssignmentStatus = 'todo' | 'done';

export interface Assignment {
  id: Id;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  updatedAt: string;
  course?: Course;
}

export interface Grade {
  id: number;
  courseId: number;
  semester: string;
  attendance: number;
  midterm: number;
  final: number;
  total: number;
  letter: string;
  course?: Course;
}

export type ApiErrorType = 'network' | 'timeout' | 'http';

export interface ApiError {
  type: ApiErrorType;
  status: number;
  message: string;
}

export interface OutboxAction {
  id: string;
  method: 'POST' | 'PATCH';
  url: string;
  body: Record<string, unknown>;
  createdAt: string;
}

export interface CacheEntry<T> {
  data: T;
  savedAt: string;
}
