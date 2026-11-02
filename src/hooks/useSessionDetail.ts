import * as sessionService from '../api/sessionService';
import {CACHE_KEYS} from '../storage/keys';
import type {Id, Session} from '../types';
import useCachedQuery from './useCachedQuery';

export default function useSessionDetail(id: Id) {
  return useCachedQuery<Session>(CACHE_KEYS.session(id), () => sessionService.getById(id), {
    seed: {
      key: CACHE_KEYS.sessions,
      pick: (list: Session[]) => list.find(s => String(s.id) === String(id)),
    },
  });
}
