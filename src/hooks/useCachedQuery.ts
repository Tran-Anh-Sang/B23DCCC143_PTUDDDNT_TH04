import {useCallback, useEffect, useRef, useState} from 'react';
import {toApiError} from '../api/client';
import {CACHE_TTL} from '../config';
import {getCache, setCache} from '../storage/cache';
import type {ApiError} from '../types';
import useNetworkStatus from './useNetworkStatus';

interface Options<T> {
  // Khi chưa có cache riêng (ví dụ chi tiết môn học), lấy tạm từ cache của danh sách
  seed?: {key: string; pick: (cached: any) => T | undefined | null};
}

export interface CachedQuery<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>; // kéo để làm mới / nút "Thử lại"
  reload: () => Promise<void>; // tải lại im lặng, không hiện spinner
  mutate: (updater: (prev: T) => T) => void; // sửa dữ liệu hiện có và ghi lại cache
}

/**
 * Chiến lược "cache trước, mạng sau":
 * 1. Đọc cache và hiển thị ngay.
 * 2. Nếu có mạng thì gọi API, thành công thì ghi đè cache.
 * 3. Khi mạng trở lại thì tự tải lại.
 * Lỗi chỉ được báo ra ngoài khi chưa có dữ liệu nào để hiển thị.
 */
export default function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: Options<T>,
): CachedQuery<T> {
  const {isOnline} = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const onlineRef = useRef(isOnline);
  onlineRef.current = isOnline;
  const dataRef = useRef<T | null>(null);
  const readyRef = useRef(false);
  const runRef = useRef(0); // bỏ qua kết quả của lượt tải đã cũ

  const fetchRemote = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      const run = runRef.current;
      if (mode === 'refresh') {
        setRefreshing(true);
      }
      try {
        const result = await fetcherRef.current();
        const savedAt = await setCache(key, result);
        if (run !== runRef.current) {
          return;
        }
        dataRef.current = result;
        setData(result);
        setLastUpdated(savedAt);
        setError(null);
      } catch (e) {
        if (run === runRef.current && dataRef.current === null) {
          setError(toApiError(e));
        }
      } finally {
        if (run === runRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [key],
  );

  // Mở màn hình / đổi key: đọc cache trước rồi mới gọi mạng
  useEffect(() => {
    const run = ++runRef.current;
    readyRef.current = false;
    dataRef.current = null;
    setData(null);
    setError(null);
    setLastUpdated(null);
    setLoading(true);
    setRefreshing(false);

    (async () => {
      let entry = await getCache<T>(key);
      const seed = optionsRef.current?.seed;
      if (!entry && seed) {
        const seedEntry = await getCache<unknown>(seed.key);
        const picked = seedEntry ? seed.pick(seedEntry.data) : undefined;
        if (seedEntry && picked) {
          entry = {data: picked, savedAt: seedEntry.savedAt};
        }
      }
      if (run !== runRef.current) {
        return;
      }
      let shown = false;
      if (entry) {
        const expired = Date.now() - new Date(entry.savedAt).getTime() > CACHE_TTL;
        if (!expired || !onlineRef.current) {
          dataRef.current = entry.data;
          setData(entry.data);
          setLastUpdated(entry.savedAt);
          setLoading(false);
          shown = true;
        }
      }
      readyRef.current = true;
      if (onlineRef.current) {
        await fetchRemote('initial');
      } else if (!shown) {
        setError({
          type: 'network',
          status: 0,
          message: 'Bạn đang offline và chưa có dữ liệu đã lưu.',
        });
        setLoading(false);
      }
    })();
  }, [key, fetchRemote]);

  // Có mạng trở lại: tải lại im lặng để cập nhật
  useEffect(() => {
    if (isOnline && readyRef.current) {
      fetchRemote('silent');
    }
  }, [isOnline, fetchRemote]);

  const refresh = useCallback(async () => {
    if (dataRef.current === null) {
      setError(null);
      setLoading(true);
      await fetchRemote('initial');
      return;
    }
    if (!onlineRef.current) {
      return;
    }
    await fetchRemote('refresh');
  }, [fetchRemote]);

  const reload = useCallback(async () => {
    if (onlineRef.current) {
      await fetchRemote('silent');
    }
  }, [fetchRemote]);

  const mutate = useCallback(
    (updater: (prev: T) => T) => {
      if (dataRef.current === null) {
        return;
      }
      const next = updater(dataRef.current);
      dataRef.current = next;
      setData(next);
      setCache(key, next);
    },
    [key],
  );

  return {data, loading, error, refreshing, lastUpdated, refresh, reload, mutate};
}
