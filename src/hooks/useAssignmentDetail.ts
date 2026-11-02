import * as assignmentService from '../api/assignmentService';
import {CACHE_KEYS} from '../storage/keys';
import type {ApiError, Assignment, Id} from '../types';
import useCachedQuery from './useCachedQuery';

const notOnServer: ApiError = {
  type: 'http',
  status: 404,
  message: 'Bài tập này chưa được đồng bộ lên máy chủ.',
};

export default function useAssignmentDetail(id: Id) {
  const local = String(id).startsWith('local-'); // tạo offline, chưa có trên server
  return useCachedQuery<Assignment>(
    CACHE_KEYS.assignment(id),
    () => (local ? Promise.reject(notOnServer) : assignmentService.getById(id)),
    {
      seed: {
        key: CACHE_KEYS.assignments,
        pick: (list: Assignment[]) => list.find(a => String(a.id) === String(id)),
      },
    },
  );
}
