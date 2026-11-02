// Tên khóa AsyncStorage
const PREFIX = '@study';

export const CACHE_KEYS = {
  student: `${PREFIX}/cache/student`,
  courses: `${PREFIX}/cache/courses`,
  sessions: `${PREFIX}/cache/sessions`,
  assignments: `${PREFIX}/cache/assignments`,
  grades: `${PREFIX}/cache/grades`,
  course: (id: number | string) => `${PREFIX}/cache/courses/${id}`,
  session: (id: number | string) => `${PREFIX}/cache/sessions/${id}`,
  assignment: (id: number | string) => `${PREFIX}/cache/assignments/${id}`,
  grade: (id: number | string) => `${PREFIX}/cache/grades/${id}`,
};

export const OUTBOX_KEY = `${PREFIX}/outbox`;
