import { CONST } from '../constants';
import { deferred } from './deferred';

export function lazyRun<T extends () => Promise<void>>(callback: T, timeout = CONST.LAZY_RUN_DEFAULT): Promise<void> {
  const p = deferred<void>();

  setTimeout(() => {
    callback()
      .then(() => p.resolve())
      .catch(() => p.reject());
  }, timeout);

  return p.promise;
}
