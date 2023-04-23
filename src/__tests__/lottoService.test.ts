import * as dotenv from 'dotenv';
import { LottoService } from '../index';
import LottoError from '../lottoError';
import { LogLevel } from '../logger';
import { seconds } from '../utils/seconds';

declare let process: {
  env: {
    LOTTO_ID: string;
    LOTTO_PWD: string;
    LOTTO_COOKIE?: string;
  };
};

dotenv.config();

const configs = { logLevel: LogLevel.DEBUG, headless: true, args: ['--no-sandbox'] };
const { LOTTO_ID, LOTTO_PWD, LOTTO_COOKIE } = process.env;
describe('lottoService', function () {
  let validCookies;

  it('should have env variables', () => {
    expect(LOTTO_ID).toBeDefined();
    expect(LOTTO_PWD).toBeDefined();
    expect(LOTTO_COOKIE).toBeDefined();
  });

  it(
    'should return valid cookies when sign-in with correct id and password',
    async () => {
      const lottoService = new LottoService(configs);

      validCookies = await lottoService.signIn(LOTTO_ID, LOTTO_PWD);
      expect(validCookies).toBeDefined();

      await lottoService.destroy();
    },
    seconds(60)
  );

  it(
    'should throw an exception when sign-in with incorrect id and password',
    async () => {
      const lottoService = new LottoService(configs);
      const incorrectID = Math.random().toString(16).slice(2, 8);
      const incorrectPWD = '123456';

      try {
        await lottoService.signIn(incorrectID, incorrectPWD);
      } catch (e) {
        expect(e).toBeDefined();
      }

      await lottoService.destroy();
    },
    seconds(60)
  );

  it(
    'should return valid cookies when sign in with valid cookie',
    async () => {
      const lottoService = new LottoService(configs);

      const cookies = await lottoService.signInWithCookie(validCookies ?? LOTTO_COOKIE);
      expect(cookies).toBeDefined();

      await lottoService.destroy();
    },
    seconds(30)
  );

  it(
    'should throw an exception when sign in with invalid cookie',
    async () => {
      const lottoService = new LottoService(configs);
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

  it(
    'run lotto service check',
    async () => {
      const lottoService = new LottoService();

      const cases = [
        { myNumber: [9, 11, 27, 36, 38, 41], round: 1061, expect: { rank: 0, matchedNumbers: [27] } },
        { myNumber: [3, 8, 29, 31, 34, 45], round: 1060, expect: { rank: 0, matchedNumbers: [3, 45] } },
        { myNumber: [9, 14, 24, 25, 33, 34], round: 1059, expect: { rank: 0, matchedNumbers: [25, 34] } },
        {
          myNumber: [3, 6, 22, 23, 24, 38],
          round: 1063,
          expect: { rank: 1, matchedNumbers: [3, 6, 22, 23, 24, 38] }
        },
        {
          myNumber: [11, 23, 25, 30, 32, 42],
          round: 1058,
          expect: { rank: 2, matchedNumbers: [11, 23, 25, 30, 32, 42] }
        },
        { myNumber: [2, 22, 26, 29, 30, 34], round: 1053, expect: { rank: 3, matchedNumbers: [22, 26, 29, 30, 34] } },
        { myNumber: [2, 15, 17, 20, 33, 42], round: 1047, expect: { rank: 4, matchedNumbers: [2, 20, 33, 42] } },
        { myNumber: [5, 17, 26, 19, 33, 41], round: 1052, expect: { rank: 5, matchedNumbers: [5, 17, 26] } },
        { myNumber: [1, 5, 17, 26, 19, 33], round: 1052, expect: { rank: 5, matchedNumbers: [5, 17, 26] } }
      ];

      cases.map(async i => {
        const result = await lottoService.check(i.myNumber, i.round);
        expect(result).toEqual(i.expect);
      });
    },
    seconds(30)
  );

  it(
    'should throw an exception when pass invalid lotto numbers',
    async () => {
      const lottoService = new LottoService(configs);

      try {
        await lottoService.check([1, 2, 3, 4, 5, 60], 1);
      } catch (e) {
        expect(e).toEqual(LottoError.InvalidLottoNumber());
      }
    },
    seconds(10)
  );
});
