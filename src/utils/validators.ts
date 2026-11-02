import {parseDateTime} from './date';

// Mỗi hàm trả về chuỗi lỗi, chuỗi rỗng nghĩa là hợp lệ

export const validateTitle = (title: string): string =>
  title.trim() ? '' : 'Vui lòng nhập tiêu đề bài tập';

export function validateDueDate(text: string): string {
  const d = parseDateTime(text);
  if (!d) {
    return 'Hạn nộp phải có dạng dd/MM/yyyy HH:mm';
  }
  if (d.getTime() < Date.now()) {
    return 'Hạn nộp không được ở trong quá khứ';
  }
  return '';
}

export const validateFullName = (name: string): string =>
  name.trim().length >= 2 ? '' : 'Họ tên phải có ít nhất 2 ký tự';

export const validateEmail = (email: string): string =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : 'Email không hợp lệ';

export const validatePhone = (phone: string): string =>
  /^0\d{9}$/.test(phone.trim()) ? '' : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0';

export const validateRequired = (value: string, label: string): string =>
  value.trim() ? '' : `Vui lòng nhập ${label}`;
