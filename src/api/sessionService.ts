import {request} from './client';
import type {Id, Session} from '../types';

export const ENDPOINT = '/sessions';
export const itemPath = (id: Id): string => `${ENDPOINT}/${id}`;

export function getAll(): Promise<Session[]> {
  return request<Session[]>('GET', `${ENDPOINT}?_expand=course`);
}

export function getById(id: Id): Promise<Session> {
  return request<Session>('GET', `${itemPath(id)}?_expand=course`);
}

export function update(id: Id, data: Partial<Session>): Promise<Session> {
  return request<Session>('PATCH', itemPath(id), data);
}

export function create(data: Partial<Session>): Promise<Session> {
  return request<Session>('POST', ENDPOINT, data);
}
