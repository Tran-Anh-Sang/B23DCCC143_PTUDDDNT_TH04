import React, {createContext, useContext, useMemo, type ReactNode} from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';
import useOutboxSync from '../hooks/useOutboxSync';

type OutboxSync = ReturnType<typeof useOutboxSync>;

interface SyncContextValue extends OutboxSync {
  isOnline: boolean;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export default function SyncProvider({children}: {children: ReactNode}) {
  const {isOnline} = useNetworkStatus();
  const sync = useOutboxSync();

  const value = useMemo<SyncContextValue>(
    () => ({isOnline, ...sync}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isOnline,
      sync.pendingCount,
      sync.syncing,
      sync.syncNow,
      sync.actions,
      sync.reloadPending,
      sync.syncVersion,
      sync.notice,
      sync.clearNotice,
      sync.setOnApplied,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync phải được dùng bên trong SyncProvider');
  }
  return ctx;
}
