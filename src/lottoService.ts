import type { BrowserConfigs, BrowserControllerInterface, LottoServiceInterface } from './types';
import LottoError from './lottoError';
import { SELECTORS } from './constants/selectors';
import { createBrowserController } from './controllers/factory';
import { URLS } from './constants/urls';
import { deferred } from './utils/deferred';
import { DHLOTTERY } from './constants/dhlottery';
import { CONST } from './constants';
import { lazyRun } from './utils/lazyRun';

export class LottoService implements LottoServiceInterface {
  browserController: BrowserControllerInterface;
  constructor(configs?: BrowserConfigs) {
    this.browserController = createBrowserController('puppeteer', {
      headless: false,
      defaultViewport: {
        width: 1080,
        height: 1024
      },
      args: ['--slowMo=30'],
      ...configs
    });
  }

  destroy = async () => {
    return lazyRun(this.browserController.close, CONST.BROWSER_DESTROY_SAFE_TIMEOUT);
  };

  signInWithCookie = async (cookies: string) => {
    // 쿠키 설정 & 페이지 이동
    const page = await this.browserController.focus(0);
    await page.setCookies(cookies);
    await page.goto(URLS.LOGIN);

    // 팝업 제거용
    await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
    await this.browserController.cleanPages([0]);

    // 로그인이 되지 않았으면 에러처리
    if (URLS.LOGIN === (await page.url())) {
      throw LottoError.InvalidCookies();
    }

    return page.getCookies();
  };

  signIn = async (id: string, password: string) => {
    const p = deferred<string>();

    // 페이지 이동
    const page = await this.browserController.focus(0);
    await page.goto(URLS.LOGIN);

    // 비동기 - 로그인 성공 핸들링
    queueMicrotask(async () => {
      await page.wait('navigation');
      await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
      await this.browserController.cleanPages([0]);

      if (p.state === 'pending') {
        p.resolve(page.getCookies());
        unsubscribe();
      }
    });

    // 비동기 - 로그인 실패 핸들링
    const unsubscribe = page.on('dialog', dialog => {
      if (dialog.message().includes(DHLOTTERY.DIALOG.ID_PWD_INCORRECT)) {
        p.reject(LottoError.CredentialsIncorrect());
      } else if (dialog.message().includes(DHLOTTERY.DIALOG.TOO_MANY_WRONG_SIGN_IN)) {
        p.reject(LottoError.TooManyWrongSignIn());
      } else {
        console.log(`Dialog '${dialog.message()}'`);
        p.reject(LottoError.UnknownError());
      }

      unsubscribe();
      dialog.dismiss();
    });

    // 로그인 시도
    await page.fill(SELECTORS.ID_INPUT, id);
    await page.fill(SELECTORS.PWD_INPUT, password);
    await page.click(SELECTORS.LOGIN_BUTTON);

    return p.promise;
  };

  purchase = async (_count: number) => {
    return [[1, 2, 3, 4, 5, 6]];
  };

  check = async (_numbers: number[]) => {
    return console.log('');
  };
}
