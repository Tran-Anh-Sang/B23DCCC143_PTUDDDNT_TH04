import AsyncStorage from '@react-native-async-storage/async-storage';
import {OUTBOX_KEY} from './keys';
import type {OutboxAction} from '../types';

type NewAction = Pick<OutboxAction, 'method' | 'url' | 'body'> &
  Partial<Pick<OutboxAction, 'id' | 'createdAt'>>;

// Các thao tác đọc-ghi được xếp hàng để không ghi đè lên nhau
let chain: Promise<unknown> = Promise.resolve();
function exclusive<T>(job: () => Promise<T>): Promise<T> {
  const run = chain.then(job, job);
  chain = run.catch(() => undefined);
  return run;
}

async function read(): Promise<OutboxAction[]> {
  try {
    const raw = await AsyncStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as OutboxAction[]) : [];
  } catch (e) {
    return [];
  }
}

async function write(list: OutboxAction[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(list));
}

export const makeId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// Trả về hàng đợi theo đúng thứ tự thêm vào
export function getAll(): Promise<OutboxAction[]> {
  return exclusive(read);
}

export function enqueue(action: NewAction): Promise<OutboxAction> {
  return exclusive(async () => {
    const item: OutboxAction = {
      id: action.id ?? makeId(),
      method: action.method,
      url: action.url,
      body: action.body,
      createdAt: action.createdAt ?? new Date().toISOString(),
    };
    const list = await read();
    list.push(item);
    await write(list);
    return item;
  });
}

export function remove(id: string): Promise<void> {
  return exclusive(async () => {
    const list = await read();
    await write(list.filter(a => a.id !== id));
  });
}

// Sửa nội dung một thao tác còn trong hàng đợi (dùng khi gộp các lần sửa cùng một mục)
export function update(
  id: string,
  changes: Partial<Pick<OutboxAction, 'body' | 'createdAt'>>,
): Promise<void> {
  return exclusive(async () => {
    const list = await read();
    await write(list.map(a => (a.id === id ? {...a, ...changes} : a)));
  });
}
