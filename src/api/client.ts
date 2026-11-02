import {BASE_URL, TIMEOUT} from '../config';
import type {ApiError} from '../types';

const MESSAGES = {
  network: 'Không thể kết nối tới máy chủ. Hãy kiểm tra mạng hoặc máy chủ rồi thử lại.',
  timeout: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',
};

function httpMessage(status: number): string {
  if (status === 404) {
    return 'Không tìm thấy dữ liệu (404).';
  }
  if (status >= 500) {
    return `Máy chủ gặp sự cố (${status}). Vui lòng thử lại sau.`;
  }
  return `Yêu cầu không hợp lệ (${status}).`;
}

export function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'type' in e &&
    'message' in e &&
    'status' in e
  );
}

// Chuẩn hóa mọi lỗi bắt được về dạng { type, status, message }
export function toApiError(e: unknown): ApiError {
  if (isApiError(e)) {
    return e;
  }
  return {type: 'network', status: 0, message: MESSAGES.network};
}

/**
 * Hàm gọi API chung: timeout 10 giây, kiểm tra mã HTTP, lỗi được chuẩn hóa.
 * Lỗi ném ra có dạng { type: 'network' | 'timeout' | 'http', status, message }.
 */
export async function request<T = any>(
  method: string,
  url: string,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      const error: ApiError = controller.signal.aborted
        ? {type: 'timeout', status: 0, message: MESSAGES.timeout}
        : {type: 'network', status: 0, message: MESSAGES.network};
      throw error;
    }
    if (!response.ok) {
      const error: ApiError = {
        type: 'http',
        status: response.status,
        message: httpMessage(response.status),
      };
      throw error;
    }
    if (response.status === 204) {
      return null as T;
    }
    try {
      return (await response.json()) as T;
    } catch (e) {
      const error: ApiError = {type: 'network', status: 0, message: MESSAGES.network};
      throw error;
    }
  } finally {
    clearTimeout(timer);
  }
}
