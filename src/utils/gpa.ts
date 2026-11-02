import type {Course, Grade} from '../types';

// Điểm hệ 10 -> hệ 4 theo bảng quy đổi của đề bài
export function toScale4(score10: number): number {
  if (score10 >= 8.5) return 4.0;
  if (score10 >= 8.0) return 3.5;
  if (score10 >= 7.0) return 3.0;
  if (score10 >= 6.5) return 2.5;
  if (score10 >= 5.5) return 2.0;
  if (score10 >= 5.0) return 1.5;
  if (score10 >= 4.0) return 1.0;
  return 0;
}

export function toLetter(score10: number): string {
  if (score10 >= 8.5) return 'A';
  if (score10 >= 8.0) return 'B+';
  if (score10 >= 7.0) return 'B';
  if (score10 >= 6.5) return 'C+';
  if (score10 >= 5.5) return 'C';
  if (score10 >= 5.0) return 'D+';
  if (score10 >= 4.0) return 'D';
  return 'F';
}

/**
 * GPA hệ 4 có trọng số theo số tín chỉ.
 * GPA = tổng(điểm hệ 4 x tín chỉ) / tổng tín chỉ các môn có điểm.
 * totalCredits là số tín chỉ tích lũy: môn điểm F không được tính.
 */
export function calcGpa(
  grades: Grade[],
  courses: Course[],
): {gpa: number; totalCredits: number} {
  let points = 0;
  let credits = 0;
  let accumulated = 0;
  grades.forEach(g => {
    const credit = courses.find(c => c.id === g.courseId)?.credits ?? g.course?.credits ?? 0;
    if (!credit || typeof g.total !== 'number') {
      return;
    }
    const scale4 = toScale4(g.total);
    points += scale4 * credit;
    credits += credit;
    if (scale4 > 0) {
      accumulated += credit;
    }
  });
  return {gpa: credits ? points / credits : 0, totalCredits: accumulated};
}
