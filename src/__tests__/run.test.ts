import * as dotenv from 'dotenv';
import { LottoService } from '../index';
import LottoError from '../lottoError';
dotenv.config();

const seconds = (n: number) => 1000 * n;
const { LOTTO_ID, LOTTO_PWD, LOTTO_COOKIE } = process.env;
describe('run', function () {
  let validCookies;

  it('should have env variables', () => {
    expect(LOTTO_ID).toBeDefined();
    expect(LOTTO_PWD).toBeDefined();
    expect(LOTTO_COOKIE).toBeDefined();
  });

  it(
    'should return valid cookies when sign-in with correct id and password',
    async () => {
      const lottoService = new LottoService({ headless: true });

      validCookies = await lottoService.signIn(LOTTO_ID, LOTTO_PWD);
      expect(validCookies).toBeDefined();

      await lottoService.destroy();
    },
    seconds(30)
  );

  it(
    'should throw an exception when sign-in with incorrect id and password',
    async () => {
      const lottoService = new LottoService({ headless: true });
      const incorrectID = Math.random().toString(16).slice(2, 8);
      const incorrectPWD = '123456';

      try {
        await lottoService.signIn(incorrectID, incorrectPWD);
      } catch (e) {
        expect(e).toBeDefined();
      }

      await lottoService.destroy();
    },
    seconds(30)
  );

  it(
    'should return valid cookies when sign in with valid cookie',
    async () => {
      const lottoService = new LottoService({ headless: true });

      const cookies = await lottoService.signInWithCookie(validCookies ?? LOTTO_COOKIE);
      expect(cookies).toBeDefined();

      await lottoService.destroy();
    },
    seconds(30)
  );

  it(
    'should throw an exception when sign in with invalid cookie',
    async () => {
      const lottoService = new LottoService({ headless: true });
      const invalidCookies = '[]';

      try {
        await lottoService.signInWithCookie(invalidCookies);
      } catch (e) {
        expect(e).toEqual(LottoError.InvalidCookies());
      }

      await lottoService.destroy();
    },
    seconds(30)
  );
});
