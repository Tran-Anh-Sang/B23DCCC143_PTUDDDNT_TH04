import {request} from './client';
import type {Id, Assignment} from '../types';

export const ENDPOINT = '/assignments';
export const itemPath = (id: Id): string => `${ENDPOINT}/${id}`;

export function getAll(): Promise<Assignment[]> {
  return request<Assignment[]>('GET', `${ENDPOINT}?_expand=course&_sort=dueDate`);
}

export function getById(id: Id): Promise<Assignment> {
  return request<Assignment>('GET', `${itemPath(id)}?_expand=course`);
}

export function update(id: Id, data: Partial<Assignment>): Promise<Assignment> {
  return request<Assignment>('PATCH', itemPath(id), data);
}

export function create(data: Partial<Assignment>): Promise<Assignment> {
  return request<Assignment>('POST', ENDPOINT, data);
}
