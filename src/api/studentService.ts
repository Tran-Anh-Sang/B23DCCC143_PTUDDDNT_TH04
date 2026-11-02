import {request} from './client';
import type {Id, Student} from '../types';

export const ENDPOINT = '/students';
export const itemPath = (id: Id): string => `${ENDPOINT}/${id}`;

export function getAll(): Promise<Student[]> {
  return request<Student[]>('GET', `${ENDPOINT}`);
}

export function getById(id: Id): Promise<Student> {
  return request<Student>('GET', `${itemPath(id)}`);
}

export function update(id: Id, data: Partial<Student>): Promise<Student> {
  return request<Student>('PATCH', itemPath(id), data);
}

export function create(data: Partial<Student>): Promise<Student> {
  return request<Student>('POST', ENDPOINT, data);
}
