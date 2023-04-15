import { LottoService } from '../app';

const sec = (n: number) => 1000 * n;

describe('run', function () {
  it(
    'should be able to sign in',
    async () => {
      const richAutomation = new LottoService();
      await richAutomation.signIn('YOUR_ID', 'YOUR_PASSWORD');
    },
    sec(10)
  );
});
