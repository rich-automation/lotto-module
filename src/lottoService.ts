import type { BrowserConfigs, BrowserControllerInterface, LottoServiceInterface } from './types';
import LottoError from './lottoError';
import { SELECTORS } from './constants/selectors';
import { createBrowserController } from './controllers/factory';
import { URLS } from './constants/urls';
import { deferred } from './utils/deferred';
import { CONST } from './constants';
import { lazyRun } from './utils/lazyRun';
import Logger, { type LoggerInterface } from './logger';
import { getCurrentLottoRound } from './utils/getCurrentLottoRound';
import { validateLottoNumber } from './utils/validateLottoNumber';
import { getWinningNumbers } from './apis/dhlottery/getWinningNumbers';
import { checkWinning } from './utils/checkWinning';
import { validatePurchaseAvailability } from './utils/validatePurchaseAvailability';
import { getCheckWinningLink } from './utils/getCheckWinningLink';

export class LottoService implements LottoServiceInterface {
  context = {
    authenticated: false
  };

  browserController: BrowserControllerInterface;
  logger: LoggerInterface;
  constructor(configs?: BrowserConfigs) {
    this.logger = new Logger(configs?.logLevel, '[LottoService]');
    this.browserController = createBrowserController(
      'puppeteer',
      {
        defaultViewport: { width: 1080, height: 1024 },
        ...configs,
        headless: configs?.headless === false ? false : 'new'
      },
      this.logger
    );
  }

  destroy = async () => {
    return lazyRun(this.browserController.close, CONST.BROWSER_DESTROY_SAFE_TIMEOUT);
  };

  signInWithCookie = async (cookies: string) => {
    // 쿠키 설정 & 페이지 이동
    const page = await this.browserController.focus(0);
    this.logger.debug('[signInWithCookie]', 'setCookies');
    await page.setCookies(cookies);
    this.logger.debug('[signInWithCookie]', 'goto', 'login page');
    await page.goto(URLS.LOGIN);
    this.logger.debug('[signInWithCookie]', 'page url', await page.url());

    // 팝업 제거용
    this.logger.debug('[signInWithCookie]', 'clear popups');
    await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
    await this.browserController.cleanPages([0]);

    // 로그인이 되지 않았으면 에러처리
    if (URLS.LOGIN === (await page.url())) {
      this.logger.info('[signInWithCookie]', 'failure');
      throw LottoError.InvalidCookies();
    }

    this.logger.info('[signInWithCookie]', 'success');
    this.context.authenticated = true;
    return page.getCookies();
  };

  signIn = async (id: string, password: string) => {
    const p = deferred<string>();

    queueMicrotask(async () => {
      // 페이지 이동
      const page = await this.browserController.focus(0);
      this.logger.debug('[signIn]', 'goto', 'login page');
      await page.goto(URLS.LOGIN);
      this.logger.debug('[signIn]', 'page url', await page.url());

      const unsubscribe = page.on('response', async response => {
        const url = response.url();

        switch (true) {
          // 로그인 실패
          case url.includes(URLS.LOGIN.replace('https://', '')): {
            this.logger.info('[signIn]', 'fallback to login page', 'failure');
            unsubscribe();

            p.reject(LottoError.CredentialsIncorrect());
            break;
          }

          // 로그인 성공
          case url.includes(URLS.MAIN.replace('https://', '')): {
            this.logger.info('[signIn]', 'fallback to main page', 'success');
            this.context.authenticated = true;
            unsubscribe();

            this.logger.debug('[signIn]', 'clear popups');
            await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
            await this.browserController.cleanPages([0]);

            const cookies = await page.getCookies();
            p.resolve(cookies);
            break;
          }
        }
      });

      // 로그인 시도
      this.logger.debug('[signIn]', 'try login');
      await page.fill(SELECTORS.ID_INPUT, id);
      await page.fill(SELECTORS.PWD_INPUT, password);
      await page.click(SELECTORS.LOGIN_BUTTON);
    });

    return p.promise;
  };

  purchase = async (amount = 5) => {
    if (!this.context.authenticated) throw LottoError.NotAuthenticated();
    this.logger.debug('[purchase]', 'validatePurchaseAvailability');
    validatePurchaseAvailability();

    // move
    this.logger.debug('[purchase]', 'move to lotto game page');
    const page = await this.browserController.focus(0);
    await page.goto(URLS.LOTTO_645);

    // click auto button
    this.logger.debug('[purchase]', 'click purchase type button -> auto');
    await page.click(SELECTORS.PURCHASE_TYPE_RANDOM_BTN);

    // set and confirm amount
    const amountString = String(Math.max(1, Math.min(5, amount)));
    this.logger.debug('[purchase]', `select purchase amount${amountString} -> amount confirm`);
    await page.select(SELECTORS.PURCHASE_AMOUNT_SELECT, amountString);
    await page.click(SELECTORS.PURCHASE_AMOUNT_CONFIRM_BTN);

    // click purchase button
    this.logger.debug('[purchase]', 'click purchase button');
    await page.click(SELECTORS.PURCHASE_BTN);
    this.logger.debug('[purchase]', 'click purchase confirm button');
    try {
      await page.click(SELECTORS.PURCHASE_CONFIRM_BTN, true);
    } catch (e) {
      this.logger.debug('[purchase]', 'purchase confirm failure', e);
      this.logger.debug('[purchase]', 'print node');
      await page.querySelectorAll(SELECTORS.PURCHASE_CONFIRM_BTN, elems => {
        this.logger.debug('[purchase]', elems);
      });
      throw e;
    }

    await page.wait(1000);

    // game result
    this.logger.debug('[purchase]', 'print result');
    return page.querySelectorAll(SELECTORS.PURCHASE_NUMBER_LIST, elems => {
      return elems.map(it => Array.from(it.children).map(child => Number(child.innerHTML)));
    });
  };

  check = async (numbers: number[], round: number = getCurrentLottoRound()) => {
    validateLottoNumber(numbers);

    this.logger.debug('[check]', 'getWinningNumbers');
    const winningNumbers = await getWinningNumbers(round);

    return checkWinning(numbers, winningNumbers);
  };

  getCheckWinningLink = (round: number, numbers: number[][]): string => {
    this.logger.debug('[getCheckWinningLink]', 'getCheckWinningLink');
    return getCheckWinningLink(round, numbers);
  };
}
