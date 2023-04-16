import { deferred } from '../../utils/deferred';

describe('deferred', () => {
  it('resolves a promise', async () => {
    const d = deferred<number>();
    expect(d.state).toBe('pending');

    d.resolve(42);
    expect(d.state).toBe('fulfilled');

    await expect(d.promise).resolves.toBe(42);
  });

  it('rejects a promise', async () => {
    const d = deferred<number>();
    expect(d.state).toBe('pending');

    d.reject('Error');
    expect(d.state).toBe('rejected');

    await expect(d.promise).rejects.toBe('Error');
  });
});
