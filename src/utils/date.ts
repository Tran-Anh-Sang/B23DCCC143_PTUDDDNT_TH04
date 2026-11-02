const pad = (n: number): string => String(n).padStart(2, '0');

// dd/MM/yyyy
export const formatDate = (value: string | Date): string => {
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// HH:mm
export const formatTime = (value: string | Date): string => {
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// dd/MM/yyyy HH:mm
export const formatDateTime = (value: string | Date): string =>
  `${formatDate(value)} ${formatTime(value)}`;

// HH:mm, dd/MM/yyyy (dùng cho "Cập nhật lần cuối")
export const formatTimestamp = (value: string | Date): string =>
  `${formatTime(value)}, ${formatDate(value)}`;

const startOfDay = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Số ngày còn lại tính theo lịch (âm nếu đã qua)
export const daysLeft = (dueDate: string): number =>
  Math.round((startOfDay(new Date(dueDate)) - startOfDay(new Date())) / 86400000);

// Quá hạn: chưa xong và thời điểm hạn nộp đã qua
export const isOverdue = (dueDate: string, status: string): boolean =>
  status !== 'done' && new Date(dueDate).getTime() < Date.now();

// Đọc chuỗi "dd/MM/yyyy HH:mm", trả về null nếu sai định dạng hoặc ngày không tồn tại
export function parseDateTime(text: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!m) {
    return null;
  }
  const [day, month, year, hour, minute] = m.slice(1).map(Number);
  const d = new Date(year, month - 1, day, hour, minute);
  const valid =
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day &&
    d.getHours() === hour &&
    d.getMinutes() === minute;
  return valid ? d : null;
}

// 2 = Thứ 2 ... 7 = Thứ 7, 8 = Chủ nhật
export const DAY_KEYS = [2, 3, 4, 5, 6, 7, 8];

export const DAY_LABELS: Record<number, string> = {
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
  8: 'Chủ nhật',
};

export const DAY_SHORT: Record<number, string> = {
  2: 'T2',
  3: 'T3',
  4: 'T4',
  5: 'T5',
  6: 'T6',
  7: 'T7',
  8: 'CN',
};

export const todayKey = (): number => {
  const g = new Date().getDay();
  return g === 0 ? 8 : g + 1;
};

// Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
export const normalize = (s: string): string =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

// "HK2 2025-2026" -> khóa so sánh (năm, học kỳ) để sắp xếp mới nhất trước
export const semesterRank = (semester: string): number => {
  const m = /HK(\d)\s+(\d{4})/.exec(semester);
  return m ? Number(m[2]) * 10 + Number(m[1]) : 0;
};
