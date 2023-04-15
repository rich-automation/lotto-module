import { SELECTORS } from './constants/selectors';
import { URLS } from './constants/urls';
import type { LottoServiceInterface } from './types';
import { createBrowserController } from './controllers/factory';

export class LottoService implements LottoServiceInterface {
  browserController = createBrowserController('puppeteer', {
    headless: false,
    defaultViewport: {
      width: 1080,
      height: 1024
    },
    args: ['--slowMo=30']
  });

  async signInWithCookie(cookie: string) {
    // 페이지 이동
    const page = await this.browserController.focus(0);

    await page.setCookie(cookie);
    await page.goto(URLS.LOGIN);

    // 팝업 제거용
    await page.wait(1500);
    await this.browserController.cleanPages([0]);

    return page.cookie();
  }

  async signIn(id: string, password: string) {
    // 페이지 이동
    const page = await this.browserController.focus(0);
    await page.goto(URLS.LOGIN);

    // 로그인
    const unsubscribe = page.on('dialog', dialog => {
      if (dialog.message() === '아이디 또는 비밀번호를 잘못 입력하셨습니다') {
        console.error('아이디 또는 비밀번호를 잘못 입력하셨습니다');
        this.browserController.close();
      }
      unsubscribe();
    });
    await page.fill(SELECTORS.ID_INPUT, id);
    await page.fill(SELECTORS.PWD_INPUT, password);
    await page.click(SELECTORS.LOGIN_BUTTON);
    await page.wait('navigation');

    // 팝업 제거용
    await page.wait(1500);
    await this.browserController.cleanPages([0]);

    unsubscribe();

    return page.cookie();
  }

  async purchase(_count: number): Promise<number[][]> {
    return [[1, 2, 3, 4, 5, 6]];
  }

  async check(_numbers: number[]): Promise<void> {
    return console.log('');
  }
}
