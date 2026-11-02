import * as sessionService from '../api/sessionService';
import {CACHE_KEYS} from '../storage/keys';
import type {Session} from '../types';
import useCachedQuery from './useCachedQuery';

export default function useSessions() {
  return useCachedQuery<Session[]>(CACHE_KEYS.sessions, sessionService.getAll);
}
