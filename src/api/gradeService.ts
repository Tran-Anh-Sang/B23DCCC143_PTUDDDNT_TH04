import {request} from './client';
import type {Id, Grade} from '../types';

export const ENDPOINT = '/grades';
export const itemPath = (id: Id): string => `${ENDPOINT}/${id}`;

export function getAll(): Promise<Grade[]> {
  return request<Grade[]>('GET', `${ENDPOINT}?_expand=course`);
}

export function getById(id: Id): Promise<Grade> {
  return request<Grade>('GET', `${itemPath(id)}?_expand=course`);
}

export function update(id: Id, data: Partial<Grade>): Promise<Grade> {
  return request<Grade>('PATCH', itemPath(id), data);
}

export function create(data: Partial<Grade>): Promise<Grade> {
  return request<Grade>('POST', ENDPOINT, data);
}
