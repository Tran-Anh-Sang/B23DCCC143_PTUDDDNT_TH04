import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {request, toApiError} from '../api/client';
import * as assignmentService from '../api/assignmentService';
import * as courseService from '../api/courseService';
import * as gradeService from '../api/gradeService';
import * as studentService from '../api/studentService';
import {STUDENT_ID} from '../config';
import useCachedQuery from '../hooks/useCachedQuery';
import type {SyncResult} from '../hooks/useOutboxSync';
import {CACHE_KEYS} from '../storage/keys';
import * as outbox from '../storage/outbox';
import type {
  ApiError,
  Assignment,
  Course,
  Grade,
  Id,
  OutboxAction,
  Student,
} from '../types';
import {useSync} from './SyncContext';

const LOCAL_PREFIX = 'local-';

export interface QueryStatus {
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

export interface NewAssignmentInput {
  courseId: number;
  title: string;
  description: string;
  dueDate: string; // ISO
}

export type StudentChanges = Partial<
  Pick<Student, 'fullName' | 'className' | 'major' | 'email' | 'phone'>
>;

export interface SubmitResult {
  ok: boolean;
  queued: boolean; // true: đã đưa vào hàng đợi, chưa gửi lên server
  error?: ApiError;
}

interface AppDataValue {
  student: Student | null;
  courses: Course[];
  assignments: Assignment[];
  grades: Grade[];
  status: {
    student: QueryStatus;
    courses: QueryStatus;
    assignments: QueryStatus;
    grades: QueryStatus;
  };
  studentPending: boolean;
  isAssignmentPending: (id: Id) => boolean;
  toggleAssignment: (id: Id) => Promise<SubmitResult>;
  addAssignment: (input: NewAssignmentInput) => Promise<SubmitResult>;
  updateStudent: (changes: StudentChanges) => Promise<SubmitResult>;
  refreshAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

// ---- Áp các thao tác chưa hoàn tất (đang gửi / chờ trong hàng đợi) lên dữ liệu server ----

const assignmentUrl = /^\/assignments(?:\/(.+))?$/;

function applyAssignmentActions(
  list: Assignment[],
  actions: OutboxAction[],
  courses: Course[],
): Assignment[] {
  let result = list;
  actions.forEach(action => {
    const match = assignmentUrl.exec(action.url);
    if (!match) {
      return;
    }
    if (action.method === 'POST') {
      const body = action.body as unknown as Assignment;
      result = [
        ...result,
        {
          ...body,
          id: `${LOCAL_PREFIX}${action.id}`,
          course: courses.find(c => c.id === body.courseId),
        },
      ];
    } else if (match[1]) {
      const targetId = match[1];
      result = result.map(item =>
        String(item.id) === targetId
          ? ({...item, ...action.body} as Assignment)
          : item,
      );
    }
  });
  return result;
}

function applyStudentActions(student: Student | null, actions: OutboxAction[]): Student | null {
  if (!student) {
    return null;
  }
  return actions
    .filter(a => a.method === 'PATCH' && a.url === studentService.itemPath(STUDENT_ID))
    .reduce<Student>((acc, a) => ({...acc, ...a.body} as Student), student);
}

const toStatus = (q: {
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}): QueryStatus => ({
  loading: q.loading,
  error: q.error,
  refreshing: q.refreshing,
  lastUpdated: q.lastUpdated,
  refresh: q.refresh,
});

export default function AppDataProvider({children}: {children: ReactNode}) {
  const sync = useSync();
  const studentQ = useCachedQuery<Student>(CACHE_KEYS.student, () =>
    studentService.getById(STUDENT_ID),
  );
  const coursesQ = useCachedQuery<Course[]>(CACHE_KEYS.courses, courseService.getAll);
  const assignmentsQ = useCachedQuery<Assignment[]>(
    CACHE_KEYS.assignments,
    assignmentService.getAll,
  );
  const gradesQ = useCachedQuery<Grade[]>(CACHE_KEYS.grades, gradeService.getAll);

  // Thao tác đang gửi (cập nhật lạc quan) – chưa vào hàng đợi
  const [inflight, setInflight] = useState<OutboxAction[]>([]);

  const courses = useMemo(() => coursesQ.data ?? [], [coursesQ.data]);

  const allActions = useMemo(() => {
    const seen = new Set<string>();
    return [...sync.actions, ...inflight].filter(a => {
      if (seen.has(a.id)) {
        return false;
      }
      seen.add(a.id);
      return true;
    });
  }, [sync.actions, inflight]);

  const assignments = useMemo(
    () => applyAssignmentActions(assignmentsQ.data ?? [], allActions, courses),
    [assignmentsQ.data, allActions, courses],
  );
  const student = useMemo(
    () => applyStudentActions(studentQ.data, allActions),
    [studentQ.data, allActions],
  );
  const grades = useMemo(
    () =>
      (gradesQ.data ?? []).map(g =>
        g.course ? g : {...g, course: courses.find(c => c.id === g.courseId)},
      ),
    [gradesQ.data, courses],
  );

  const pendingIds = useMemo(() => {
    const ids = new Set<string>();
    sync.actions.forEach(a => {
      const match = assignmentUrl.exec(a.url);
      if (!match) {
        return;
      }
      ids.add(a.method === 'POST' ? `${LOCAL_PREFIX}${a.id}` : match[1] ?? '');
    });
    return ids;
  }, [sync.actions]);

  const studentPending = useMemo(
    () => sync.actions.some(a => a.url === studentService.itemPath(STUDENT_ID)),
    [sync.actions],
  );

  const isAssignmentPending = useCallback(
    (id: Id) => pendingIds.has(String(id)),
    [pendingIds],
  );

  // Refs để các callback luôn đọc giá trị mới nhất
  const assignmentsRef = useRef(assignments);
  assignmentsRef.current = assignments;
  const pendingRef = useRef(sync.actions);
  pendingRef.current = sync.actions;
  const onlineRef = useRef(sync.isOnline);
  onlineRef.current = sync.isOnline;
  const coursesRef = useRef(courses);
  coursesRef.current = courses;
  const queriesRef = useRef({studentQ, coursesQ, assignmentsQ, gradesQ});
  queriesRef.current = {studentQ, coursesQ, assignmentsQ, gradesQ};

  // Ghi kết quả server trả về vào dữ liệu gốc (và cache) để không bị "nhảy" giao diện
  const applyResults = useCallback((results: SyncResult[]) => {
    results.forEach(({action, result}) => {
      if (!result) {
        return;
      }
      if (action.url === studentService.itemPath(STUDENT_ID)) {
        queriesRef.current.studentQ.mutate(() => result as Student);
        return;
      }
      if (!assignmentUrl.test(action.url)) {
        return;
      }
      const saved = result as Assignment;
      if (action.method === 'POST') {
        const withCourse = {
          ...saved,
          course: coursesRef.current.find(c => c.id === saved.courseId),
        };
        queriesRef.current.assignmentsQ.mutate(list => [...list, withCourse]);
      } else {
        queriesRef.current.assignmentsQ.mutate(list =>
          list.map(a => (String(a.id) === String(saved.id) ? {...a, ...saved} : a)),
        );
      }
    });
  }, []);

  const {setOnApplied, reloadPending, syncNow} = sync;
  useEffect(() => {
    setOnApplied(applyResults);
    return () => setOnApplied(null);
  }, [setOnApplied, applyResults]);

  // Sau mỗi lần đồng bộ: tải lại dữ liệu mới nhất từ server
  useEffect(() => {
    if (sync.syncVersion === 0) {
      return;
    }
    const q = queriesRef.current;
    q.studentQ.reload();
    q.assignmentsQ.reload();
    q.coursesQ.reload();
    q.gradesQ.reload();
  }, [sync.syncVersion]);

  // Đưa thao tác vào hàng đợi; các lần sửa cùng một mục được gộp thành một thao tác
  const queue = useCallback(
    async (action: OutboxAction) => {
      const existing =
        action.method === 'PATCH'
          ? pendingRef.current.find(a => a.method === 'PATCH' && a.url === action.url)
          : undefined;
      if (existing) {
        await outbox.update(existing.id, {
          body: {...existing.body, ...action.body},
          createdAt: action.createdAt,
        });
      } else {
        await outbox.enqueue(action);
      }
      await reloadPending();
    },
    [reloadPending],
  );

  const submit = useCallback(
    async (input: {
      method: 'POST' | 'PATCH';
      url: string;
      body: Record<string, unknown>;
    }): Promise<SubmitResult> => {
      const createdAt = new Date().toISOString();
      const action: OutboxAction = {
        id: outbox.makeId(),
        method: input.method,
        url: input.url,
        body: {...input.body, updatedAt: createdAt},
        createdAt,
      };
      const drop = () => setInflight(prev => prev.filter(a => a.id !== action.id));

      if (!onlineRef.current) {
        await queue(action);
        return {ok: true, queued: true};
      }

      setInflight(prev => [...prev, action]); // cập nhật lạc quan: giao diện đổi ngay
      try {
        const result = await request(action.method, action.url, action.body);
        applyResults([{action, result}]);
        drop();
        return {ok: true, queued: false};
      } catch (e) {
        const error = toApiError(e);
        if (error.type === 'http') {
          drop(); // server báo lỗi: hoàn tác
          return {ok: false, queued: false, error};
        }
        await queue(action); // mất mạng / quá thời gian: giữ lại để đồng bộ sau
        drop();
        return {ok: true, queued: true};
      }
    },
    [queue, applyResults],
  );

  const toggleAssignment = useCallback(
    async (id: Id): Promise<SubmitResult> => {
      const item = assignmentsRef.current.find(a => String(a.id) === String(id));
      if (!item) {
        return {ok: false, queued: false};
      }
      const status = item.status === 'done' ? 'todo' : 'done';

      // Bài tập vừa tạo offline, chưa có trên server: sửa thẳng vào thao tác POST đang chờ
      if (String(id).startsWith(LOCAL_PREFIX)) {
        const queued = pendingRef.current.find(a => `${LOCAL_PREFIX}${a.id}` === String(id));
        if (!queued) {
          return {ok: false, queued: false};
        }
        await outbox.update(queued.id, {body: {...queued.body, status}});
        await reloadPending();
        return {ok: true, queued: true};
      }
      return submit({
        method: 'PATCH',
        url: assignmentService.itemPath(id),
        body: {status},
      });
    },
    [submit, reloadPending],
  );

  const addAssignment = useCallback(
    (input: NewAssignmentInput) =>
      submit({
        method: 'POST',
        url: assignmentService.ENDPOINT,
        body: {
          courseId: input.courseId,
          title: input.title.trim(),
          description: input.description.trim(),
          dueDate: input.dueDate,
          status: 'todo',
        },
      }),
    [submit],
  );

  const updateStudent = useCallback(
    (changes: StudentChanges) =>
      submit({
        method: 'PATCH',
        url: studentService.itemPath(STUDENT_ID),
        body: {...changes},
      }),
    [submit],
  );

  const refreshAll = useCallback(async () => {
    if (onlineRef.current) {
      await syncNow();
    }
    const q = queriesRef.current;
    await Promise.all([q.studentQ.refresh(), q.coursesQ.refresh(), q.assignmentsQ.refresh(), q.gradesQ.refresh()]);
  }, [syncNow]);

  const status = useMemo(
    () => ({
      student: toStatus(studentQ),
      courses: toStatus(coursesQ),
      assignments: toStatus(assignmentsQ),
      grades: toStatus(gradesQ),
    }),
    [studentQ, coursesQ, assignmentsQ, gradesQ],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      student,
      courses,
      assignments,
      grades,
      status,
      studentPending,
      isAssignmentPending,
      toggleAssignment,
      addAssignment,
      updateStudent,
      refreshAll,
    }),
    [
      student,
      courses,
      assignments,
      grades,
      status,
      studentPending,
      isAssignmentPending,
      toggleAssignment,
      addAssignment,
      updateStudent,
      refreshAll,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData phải được dùng bên trong AppDataProvider');
  }
  return ctx;
}
