import AsyncStorage from '@react-native-async-storage/async-storage';
import type {CacheEntry} from '../types';

export async function getCache<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch (e) {
    return null;
  }
}

// Lưu { data, savedAt } và trả về thời điểm lưu (ISO)
export async function setCache<T>(key: string, data: T): Promise<string> {
  const savedAt = new Date().toISOString();
  try {
    const entry: CacheEntry<T> = {data, savedAt};
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // Bỏ qua lỗi ghi cache, ứng dụng vẫn chạy bình thường
  }
  return savedAt;
}
