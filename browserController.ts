import { Browser, Dialog, HTTPResponse, Page } from "puppeteer";
import puppeteer from "puppeteer";

interface BrowserControllerInterface {
  getBrowser: () => Promise<Browser>;
  getNewPage: () => Promise<Page>;
  setViewPortSize: (
    page: Page,
    size: { width: number; height: number }
  ) => Promise<void>;
  navigateWithUrl: (page: Page, url: string) => Promise<HTTPResponse>;
  fillInput: (
    page: Page,
    selector: string,
    value: string | number
  ) => Promise<void>;
  clickForm: (page: Page, selector: string) => Promise<void>;
  onShowDialog: (
    page: Page,
    callback: (dialog: Dialog) => void
  ) => Promise<void>;
  waitForTime: (page: Page, time: number) => Promise<void>;
  waitForNavigation: (page: Page) => Promise<HTTPResponse>;
  cleanPages: (browser: Browser, remainingTabIndex: number[]) => Promise<void>;
}

export class BrowserController implements BrowserControllerInterface {
  browser?: Browser;
  config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.browser = undefined;
    this.config = config;
  }

  async getBrowser() {
    const browser = this.browser ?? (await puppeteer.launch(this.config));
    this.browser = browser;
    return browser;
  }
  async getNewPage() {
    const browser = await this.getBrowser();
    this.browser = browser;
    return await browser.newPage();
  }

  async setViewPortSize(page: Page, size: { width: number; height: number }) {
    return await page.setViewport(size);
  }

  async navigateWithUrl(page: Page, url: string) {
    return await page.goto(url);
  }

  async fillInput(page: Page, selector: string, value: string | number) {
    return await page.type(selector, value.toString());
  }

  async clickForm(page: Page, selector: string) {
    return await page.click(selector);
  }

  async onShowDialog(page: Page, callback: (dialog: Dialog) => void) {
    page.on("dialog", callback);
  }

  async waitForTime(page: Page, time: number) {
    return await page.waitForTimeout(time);
  }

  async waitForNavigation(page: Page) {
    return await page.waitForNavigation({ waitUntil: "load" });
  }
  async cleanPages(browser: Browser, remainingTabIndex: number[]) {
    const pages = await browser.pages();
    pages.map((item, index) => {
      if (!remainingTabIndex.includes(index)) {
        item.close();
      }
    });
  }
}
