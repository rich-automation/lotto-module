import * as dotenv from 'dotenv';
import { LottoService } from '../app';
dotenv.config();

const sec = (n: number) => 1000 * n;
const { LOTTO_ID, LOTTO_PWD } = process.env;
describe('run', function () {
  it('should have env variables', () => {
    expect(LOTTO_ID).toBeDefined();
    expect(LOTTO_PWD).toBeDefined();
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
