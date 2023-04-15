import * as dotenv from 'dotenv';
import { LottoService } from '../index';
dotenv.config();

const sec = (n: number) => 1000 * n;
const { LOTTO_ID, LOTTO_PWD, LOTTO_COOKIE } = process.env;
describe('run', function () {
  it('should have env variables', () => {
    expect(LOTTO_ID).toBeDefined();
    expect(LOTTO_PWD).toBeDefined();
    expect(LOTTO_COOKIE).toBeDefined();
  });

  it(
    'should be able to sign in with id and password',
    async () => {
      const richAutomation = new LottoService();
      const cookie = await richAutomation.signIn(LOTTO_ID, LOTTO_PWD);

      expect(cookie).toBeDefined();
    },
    sec(30)
  );

  it(
    'should be able to sign in with cookie',
    async () => {
      const richAutomation = new LottoService();
      const cookie = await richAutomation.signInWithCookie(LOTTO_COOKIE);

      expect(cookie).toBeDefined();
    },
    sec(30)
  );
});
