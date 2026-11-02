import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';

// Chỉ đăng ký NetInfo một lần cho cả ứng dụng, các hook dùng chung trạng thái này
let online = true;
let started = false;
const listeners = new Set<(value: boolean) => void>();

function start(): void {
  if (started) {
    return;
  }
  started = true;
  NetInfo.addEventListener(state => {
    const next = state.isConnected !== false;
    if (next !== online) {
      online = next;
      listeners.forEach(listener => listener(next));
    }
  });
}

export const getIsOnline = (): boolean => online;

export default function useNetworkStatus(): {isOnline: boolean} {
  const [isOnline, setIsOnline] = useState(online);

  useEffect(() => {
    start();
    listeners.add(setIsOnline);
    setIsOnline(online);
    return () => {
      listeners.delete(setIsOnline);
    };
  }, []);

  return {isOnline};
}
