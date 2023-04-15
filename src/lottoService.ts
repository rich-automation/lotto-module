import type { Dialog } from 'puppeteer';
import { BrowserController } from './browserController';
import { SELECTORS } from '../constants/selectors';

interface LottoServiceInterface {
  signIn(id: string, password: string): void;
  purchase(count: number): Promise<number[][]>;
  check(numbers: number[]): Promise<void>;
}

export class LottoService implements LottoServiceInterface {
  BrowserController = new BrowserController({
    headless: false,
    args: ['--window-size-1920,1080'],
    slowMo: 30
  });

  async signIn(id: string, password: string): Promise<void> {
    await this.BrowserController.setViewPortSize({
      width: 1080,
      height: 1024
    });

    await Promise.all([
      this.BrowserController.navigateWithUrl(SELECTORS.LOGIN_URL),
      this.BrowserController.waitForNavigation()
    ]);

    await this.BrowserController.fillInput(SELECTORS.ID_INPUT_SELECTOR, id);
    await this.BrowserController.fillInput(SELECTORS.PWD_INPUT_SELECTOR, password);
    await this.BrowserController.clickForm(SELECTORS.LOGIN_BUTTON_SELECTOR);

    const browser = await this.BrowserController.getBrowser();

    const onShowDialog = (dialog: Dialog) => {
      //아이디 또는 비밀번호를 잘못 입력했을 경우 브라우저를 닫고 종료한다.
      if (dialog.message() === '아이디 또는 비밀번호를 잘못 입력하셨습니다') {
        console.error('아이디 또는 비밀번호를 잘못 입력하셨습니다');
        browser.close();
      }
    };

    await this.BrowserController.onShowDialog(onShowDialog);

    await Promise.all([this.BrowserController.waitForNavigation(), this.BrowserController.waitForTime(1000)]);

    // 팝업 제거용
    await this.BrowserController.cleanPages([1]);
  }

  async purchase(_count: number): Promise<number[][]> {
    return [[1, 2, 3, 4, 5, 6]];
  }

  async check(_numbers: number[]): Promise<void> {
    return console.log('');
  }
}
