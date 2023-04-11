import { BrowserController } from "./browserController";
import { Dialog } from "puppeteer";

interface LottoServiceInterface {
  signIn(id: string, password: string): void;
  purchase(count: number): Promise<number[][]>;
  check(numbers: number[]): Promise<void>;
}

export class LottoService implements LottoServiceInterface {
  BrowserController = new BrowserController({
    headless: false,
    args: ["--window-size-1920,1080"],
    slowMo: 30,
  });

  async signIn(id: string, password: string): Promise<void> {
    const LOGIN_URL = "https://dhlottery.co.kr/user.do?method=login&returnUrl=";
    const ID_INPUT_SELECTOR = "#userId";
    const PWD_INPUT_SELECTOR =
      "#article > div:nth-child(2) > div > form > div > div.inner > fieldset > div.form > input[type=password]:nth-child(2)";
    const LOGIN_BUTTON_SELECTOR =
      "#article > div:nth-child(2) > div > form > div > div.inner > fieldset > div.form > a";

    const page = await this.BrowserController.getNewPage();

    await this.BrowserController.setViewPortSize(page, {
      width: 1080,
      height: 1024,
    });

    await Promise.all([
      this.BrowserController.navigateWithUrl(page, LOGIN_URL),
      this.BrowserController.waitForNavigation(page),
    ]);

    await this.BrowserController.fillInput(page, ID_INPUT_SELECTOR, id);
    await this.BrowserController.fillInput(page, PWD_INPUT_SELECTOR, password);
    await this.BrowserController.clickForm(page, LOGIN_BUTTON_SELECTOR);

    const browser = await this.BrowserController.getBrowser();

    const onShowDialog = (dialog: Dialog) => {
      //아이디 또는 비밀번호를 잘못 입력했을 경우 브라우저를 닫고 종료한다.
      if (dialog.message() === "아이디 또는 비밀번호를 잘못 입력하셨습니다") {
        console.error("아이디 또는 비밀번호를 잘못 입력하셨습니다");
        return browser.close();
      }
    };

    await this.BrowserController.onShowDialog(page, onShowDialog);

    await Promise.all([
      this.BrowserController.waitForNavigation(page),
      this.BrowserController.waitForTime(page, 1000),
    ]);

    await this.BrowserController.cleanPages(browser, [1]);
  }

  async purchase(count: number): Promise<number[][]> {
    return await [[1, 2, 3, 4, 5, 6]];
  }

  async check(numbers: number[]): Promise<void> {
    return await console.log("");
  }
}
