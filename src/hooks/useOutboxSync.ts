import {useCallback, useEffect, useRef, useState} from 'react';
import {request, toApiError} from '../api/client';
import * as outbox from '../storage/outbox';
import type {OutboxAction} from '../types';
import useNetworkStatus, {getIsOnline} from './useNetworkStatus';

export interface SyncResult {
  action: OutboxAction;
  result: any;
}

const LABELS: Record<string, string> = {
  '/students': 'thông tin cá nhân',
  '/assignments': 'bài tập',
};

const labelOf = (url: string): string => LABELS[`/${url.split('/')[1]}`] ?? 'dữ liệu';

/**
 * Tự đồng bộ hàng đợi khi isOnline chuyển sang true.
 * - Gửi lần lượt theo đúng thứ tự thêm vào.
 * - Thành công thì xóa khỏi hàng đợi; lỗi thì giữ lại để thử lại sau.
 * - Xung đột (B5): với PATCH, nếu updatedAt trên server mới hơn thời điểm thực hiện
 *   thao tác offline thì bỏ thao tác, ưu tiên dữ liệu server và báo cho người dùng.
 */
export default function useOutboxSync() {
  const {isOnline} = useNetworkStatus();
  const [actions, setActions] = useState<OutboxAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const runningRef = useRef(false);
  const appliedRef = useRef<((results: SyncResult[]) => void) | null>(null);

  const reloadPending = useCallback(async () => {
    setActions(await outbox.getAll());
  }, []);

  const setOnApplied = useCallback((fn: ((results: SyncResult[]) => void) | null) => {
    appliedRef.current = fn;
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  const syncNow = useCallback(async () => {
    if (runningRef.current || !getIsOnline()) {
      return;
    }
    runningRef.current = true;
    try {
      const queue = await outbox.getAll();
      if (queue.length === 0) {
        return;
      }
      setSyncing(true);
      const applied: SyncResult[] = [];
      const conflicts: string[] = [];
      let failed = false;

      for (const action of queue) {
        try {
          if (action.method === 'PATCH') {
            const server = await request<{updatedAt?: string}>('GET', action.url);
            const serverTime = server?.updatedAt ? new Date(server.updatedAt).getTime() : 0;
            if (serverTime > new Date(action.createdAt).getTime()) {
              await outbox.remove(action.id);
              conflicts.push(labelOf(action.url));
              continue;
            }
          }
          const result = await request(action.method, action.url, action.body);
          await outbox.remove(action.id);
          applied.push({action, result});
        } catch (e) {
          failed = true;
          if (toApiError(e).type !== 'http') {
            break; // mất mạng giữa chừng: dừng, giữ nguyên thứ tự các thao tác còn lại
          }
        }
      }

      appliedRef.current?.(applied);
      await reloadPending();
      setSyncVersion(v => v + 1);

      const parts: string[] = [];
      if (applied.length > 0) {
        parts.push(`Đã đồng bộ ${applied.length} thay đổi`);
      }
      if (conflicts.length > 0) {
        parts.push(
          `${conflicts.length} thay đổi (${[...new Set(conflicts)].join(', ')}) bị bỏ qua vì dữ liệu trên máy chủ mới hơn`,
        );
      }
      if (failed) {
        parts.push('Một số thay đổi chưa gửi được, sẽ thử lại sau');
      }
      if (parts.length > 0) {
        setNotice(parts.join('. ') + '.');
      }
    } finally {
      runningRef.current = false;
      setSyncing(false);
    }
  }, [reloadPending]);

  useEffect(() => {
    reloadPending();
  }, [reloadPending]);

  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  return {
    pendingCount: actions.length,
    syncing,
    syncNow,
    actions,
    reloadPending,
    syncVersion,
    notice,
    clearNotice,
    setOnApplied,
  };
}
