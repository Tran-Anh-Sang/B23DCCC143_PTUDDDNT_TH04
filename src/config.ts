import {Platform} from 'react-native';

// Điện thoại thật: điền IP LAN của máy tính, ví dụ '192.168.1.10'.
// Để trống thì dùng địa chỉ mặc định cho máy ảo.
const DEV_HOST = '';

// Android emulator gọi máy tính qua 10.0.2.2; iOS simulator dùng localhost.
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const BASE_URL = `http://${DEV_HOST || DEFAULT_HOST}:3000`;
export const TIMEOUT = 10000; // 10 giây
export const CACHE_TTL = 24 * 60 * 60 * 1000; // cache quá 24 giờ chỉ dùng khi offline
export const STUDENT_ID = 1;
