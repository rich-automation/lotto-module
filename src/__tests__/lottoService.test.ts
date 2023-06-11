import * as dotenv from 'dotenv';
import { BrowserConfigs, getCurrentLottoRound, LottoService } from '../index';
import LottoError from '../lottoError';
import { seconds } from '../utils/seconds';
import { LogLevel } from '../logger';
import { lazyRun } from '../utils/lazyRun';
import { BrowserPageInterface } from '../types';
import { getCheckWinningLink } from '../utils/getCheckWinningLink';

dotenv.config();
const { LOTTO_ID, LOTTO_PWD, LOTTO_COOKIE } = process.env;

describe.each(['puppeteer', 'playwright'])('lottoService.%s', (controller: 'playwright' | 'puppeteer') => {
  const configs: BrowserConfigs = {
    controller,
    logLevel: LogLevel.NONE,
    headless: true,
    args: ['--no-sandbox']
  };
  let validCookies;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should have env variables', () => {
    expect(LOTTO_ID).toBeDefined();
    expect(LOTTO_PWD).toBeDefined();
    expect(LOTTO_COOKIE).toBeDefined();
  });

  describe('signIn', () => {
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
  });

  describe('signInWithCookie', () => {
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
  });

  describe('check', () => {
    it(
      'should return valid rank and matched numbers',
      async () => {
        const lottoService = new LottoService(configs);

        const cases = [
          {
            numbers: [[2, 15, 17, 20, 33, 42]],
            round: 1047,
            expectedResult: [{ rank: 4, matchedNumbers: [2, 20, 33, 42] }]
          },
          {
            numbers: [
              [5, 17, 26, 19, 33, 41],
              [1, 5, 17, 26, 19, 33]
            ],
            round: 1052,
            expectedResult: [
              { rank: 5, matchedNumbers: [5, 17, 26] },
              { rank: 5, matchedNumbers: [5, 17, 26] }
            ]
          },
          {
            numbers: [[2, 22, 26, 29, 30, 34]],
            round: 1053,
            expectedResult: [{ rank: 3, matchedNumbers: [22, 26, 29, 30, 34] }]
          },
          {
            numbers: [[11, 23, 25, 30, 32, 42]],
            round: 1058,
            expectedResult: [{ rank: 2, matchedNumbers: [11, 23, 25, 30, 32, 42] }]
          },
          {
            numbers: [[9, 14, 24, 25, 33, 34]],
            round: 1059,
            expectedResult: [{ rank: 0, matchedNumbers: [25, 34] }]
          },
          {
            numbers: [[3, 8, 29, 31, 34, 45]],
            round: 1060,
            expectedResult: [{ rank: 0, matchedNumbers: [3, 45] }]
          },
          {
            numbers: [[9, 11, 27, 36, 38, 41]],
            round: 1061,
            expectedResult: [{ rank: 0, matchedNumbers: [27] }]
          },
          {
            numbers: [[3, 6, 22, 23, 24, 38]],
            round: 1063,
            expectedResult: [{ rank: 1, matchedNumbers: [3, 6, 22, 23, 24, 38] }]
          }
        ];

        for (const { numbers, round, expectedResult } of cases) {
          const result = await lottoService.check(numbers, round);
          expect(result).toEqual(expectedResult);
        }

        await lazyRun(() => lottoService.destroy(), seconds(1));
      },
      seconds(60)
    );

    it(
      'should throw an exception when pass invalid lotto numbers',
      async () => {
        const lottoService = new LottoService(configs);

        try {
          await lottoService.check([[1, 2, 3, 4, 5, 60]], 1);
        } catch (e) {
          expect(e).toEqual(LottoError.InvalidLottoNumber());
        }

        await lottoService.destroy();
      },
      seconds(10)
    );
  });

  describe('purchase', () => {
    it('should throw an exception when purchase without authentication', async () => {
      const lottoService = new LottoService(configs);

      await expect(lottoService.purchase()).rejects.toThrow(LottoError.NotAuthenticated());

      await lottoService.destroy();
    });

    it('should throw an exception when purchase unavailable', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sun Apr 30 2023 05:00:00 GMT+0900').getTime());
      const lottoService = new LottoService(configs);
      lottoService.context.authenticated = true;

      await expect(lottoService.purchase()).rejects.toThrowError(LottoError.PurchaseUnavailable());

      await lottoService.destroy();
    });

    it('should purchase lotto game (mock)', async () => {
      const mockPage = {
        goto: jest.fn(),
        click: jest.fn(),
        select: jest.fn(),
        wait: jest.fn(),
        querySelectorAll: jest.fn(() => [[1, 2, 3, 4, 5, 6]])
      } as unknown as BrowserPageInterface;

      const lottoService = new LottoService(configs);
      lottoService.context.authenticated = true;
      lottoService.browserController = { ...lottoService.browserController, focus: async () => mockPage };

      const numbers = await lottoService.purchase(1);

      expect(mockPage.goto).toHaveBeenCalled();
      expect(mockPage.click).toHaveBeenCalled();
      expect(mockPage.select).toHaveBeenCalled();
      expect(mockPage.wait).toHaveBeenCalled();
      expect(mockPage.querySelectorAll).toHaveBeenCalled();

      expect(numbers).toHaveLength(1);
      expect(numbers[0]).toHaveLength(6);

      await lottoService.destroy();
    });

    // 일주일 구매갯수 제한으로 인해 테스트 스킵
    it.skip(
      'should purchase lotto game with given count',
      async () => {
        const lottoService = new LottoService(configs);

        await lottoService.signIn(LOTTO_ID, LOTTO_PWD);
        const numbers = await lottoService.purchase(1);

        expect(numbers).toHaveLength(1);
        expect(numbers[0]).toHaveLength(6);

        const nextRound = getCurrentLottoRound() + 1;
        console.log(lottoService.getCheckWinningLink(nextRound, numbers));

        await lazyRun(() => lottoService.destroy(), seconds(1));
      },
      seconds(30)
    );
  });

  describe('getCheckWinningLink', () => {
    it('should call utils/getCheckWinningLink', async () => {
      const lottoService = new LottoService(configs);
      const round = 1;
      const numbers = [[1, 2, 3, 4, 5, 6]];

      const result = lottoService.getCheckWinningLink(numbers, round);
      const expected = getCheckWinningLink(numbers, round);

      expect(result).toStrictEqual(expected);
    });
  });
});
