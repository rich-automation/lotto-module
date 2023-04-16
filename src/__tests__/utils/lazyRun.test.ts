import { lazyRun } from '../../utils/lazyRun';

describe('lazyRun', () => {
  it('should run callback after specified timeout', async () => {
    const start = Date.now();
    await lazyRun(async () => {
      // Simulate some long-running async operation
      await new Promise(resolve => setTimeout(resolve, 500));
    }, 1000);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(1000);
  });

  it('should resolve when callback succeeds', async () => {
    await expect(
      lazyRun(async () => {
        // Do some stuff
      })
    ).resolves.toBeUndefined();
  });

  it('should reject when callback fails', async () => {
    await expect(
      lazyRun(async () => {
        throw new Error('Callback failed');
      })
    ).rejects.toThrow('Callback failed');
  });
});
