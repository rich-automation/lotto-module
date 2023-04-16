import type { BrowserConfigs, BrowserControllerInterface, LottoServiceInterface, Unsubscribe } from './types';
import LottoError from './lottoError';
import { SELECTORS } from './constants/selectors';
import { createBrowserController } from './controllers/factory';
import { URLS } from './constants/urls';
import { deferred } from './utils/deferred';
import { CONST } from './constants';
import { lazyRun } from './utils/lazyRun';
import Logger, { type LoggerInterface } from './logger';

export class LottoService implements LottoServiceInterface {
  browserController: BrowserControllerInterface;
  logger: LoggerInterface;
  constructor(configs?: BrowserConfigs) {
    this.logger = new Logger(configs?.logLevel, '[LottoService]');
    this.browserController = createBrowserController(
      'puppeteer',
      {
        headless: false,
        defaultViewport: { width: 1080, height: 1024 },
        ...configs
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

      const unsubscribes: Unsubscribe[] = [];
      unsubscribes.push(
        page.on('dialog', async dialog => {
          this.logger.info('[signIn]', 'dialog', dialog.message());
          dialog.dismiss();
        })
      );
      unsubscribes.push(
        page.on('response', async response => {
          const url = response.url();

          if (url.includes(URLS.LOGIN.replace('https://', ''))) {
            // 로그인 실패
            this.logger.info('[signIn]', 'fallback to login page', 'failure');
            unsubscribes.forEach(fn => fn());

            p.reject(LottoError.CredentialsIncorrect());
          } else if (url.includes(URLS.MAIN.replace('https://', ''))) {
            // 로그인 성공
            this.logger.info('[signIn]', 'fallback to main page', 'success');
            unsubscribes.forEach(fn => fn());

            this.logger.debug('[signIn]', 'clear popups');
            await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
            await this.browserController.cleanPages([0]);

            const cookies = await page.getCookies();
            p.resolve(cookies);
          }
        })
      );

      // 로그인 시도
      this.logger.debug('[signIn]', 'try login');
      await page.fill(SELECTORS.ID_INPUT, id);
      await page.fill(SELECTORS.PWD_INPUT, password);
      await page.click(SELECTORS.LOGIN_BUTTON);
    });

    return p.promise;
  };

  purchase = async (_count: number) => {
    return [[1, 2, 3, 4, 5, 6]];
  };

  check = async (_numbers: number[]) => {
    return console.log('');
  };
}
