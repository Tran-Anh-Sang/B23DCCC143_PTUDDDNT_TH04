import {request} from './client';
import type {Id, Course} from '../types';

export const ENDPOINT = '/courses';
export const itemPath = (id: Id): string => `${ENDPOINT}/${id}`;

export function getAll(): Promise<Course[]> {
  return request<Course[]>('GET', `${ENDPOINT}`);
}

export function getById(id: Id): Promise<Course> {
  return request<Course>('GET', `${itemPath(id)}`);
}

export function update(id: Id, data: Partial<Course>): Promise<Course> {
  return request<Course>('PATCH', itemPath(id), data);
}

export function create(data: Partial<Course>): Promise<Course> {
  return request<Course>('POST', ENDPOINT, data);
}
