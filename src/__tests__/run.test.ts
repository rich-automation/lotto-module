import { config } from 'dotenv';
import { LottoService } from '../app';

const { LOTTO_ID, LOTTO_PWD } = process.env;
const sec = (n: number) => 1000 * n;
config();

describe('run', function () {
  it('should have env variables', () => {
    expect(LOTTO_ID).not.toBeDefined();
    expect(LOTTO_PWD).not.toBeDefined();
  });

  it(
    'should be able to sign in',
    async () => {
      const richAutomation = new LottoService();
      await richAutomation.signIn(LOTTO_ID, LOTTO_PWD);
    },
    sec(10)
  );
});
