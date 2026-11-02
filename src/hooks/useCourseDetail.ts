import * as courseService from '../api/courseService';
import {CACHE_KEYS} from '../storage/keys';
import type {Course, Id} from '../types';
import useCachedQuery from './useCachedQuery';

// Nhận id rồi tự gọi API lấy chi tiết; tạm lấy từ cache danh sách nếu chưa có cache riêng
export default function useCourseDetail(id: Id) {
  return useCachedQuery<Course>(CACHE_KEYS.course(id), () => courseService.getById(id), {
    seed: {
      key: CACHE_KEYS.courses,
      pick: (list: Course[]) => list.find(c => String(c.id) === String(id)),
    },
  });
}
