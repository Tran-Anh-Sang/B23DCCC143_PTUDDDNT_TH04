import * as gradeService from '../api/gradeService';
import {CACHE_KEYS} from '../storage/keys';
import type {Grade, Id} from '../types';
import useCachedQuery from './useCachedQuery';

export default function useGradeDetail(id: Id) {
  return useCachedQuery<Grade>(CACHE_KEYS.grade(id), () => gradeService.getById(id), {
    seed: {
      key: CACHE_KEYS.grades,
      pick: (list: Grade[]) => list.find(g => String(g.id) === String(id)),
    },
  });
}
