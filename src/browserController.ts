import type { Browser, Dialog, HTTPResponse, Page } from 'puppeteer';
import puppeteer from 'puppeteer';

interface BrowserControllerInterface {
  getBrowser: () => Promise<Browser>;
  getNewPage: () => Promise<Page>;
  getFocusedPage: () => Promise<Page>;
  setViewPortSize: (size: { width: number; height: number }, tabIndex?: number) => Promise<void>;
  navigateWithUrl: (url: string, tabIndex?: number) => Promise<HTTPResponse>;
  fillInput: (selector: string, value: string | number, tabIndex?: number) => Promise<void>;
  clickForm: (selector: string, tabIndex?: number) => Promise<void>;
  onShowDialog: (callback: (dialog: Dialog) => void, tabIndex?: number) => Promise<void>;
  waitForTime: (time: number, tabIndex?: number) => Promise<void>;
  waitForNavigation: (tabIndex?: number) => Promise<HTTPResponse>;
  cleanPages: (remainingTabIndex: number[]) => Promise<void>;
}

export class BrowserController implements BrowserControllerInterface {
  browser?: Browser;
  config: Record<string, unknown>;

  constructor(config: Record<string, unknown>) {
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
    return await browser.newPage();
  }

  async getFocusedPage(tabIndex?: number): Promise<Page> {
    const browser = await this.getBrowser();
    const pages = await browser.pages();

    // return pages.find(async (page) => page === (await browser.target().page()));
    const index = tabIndex && tabIndex >= 0 && tabIndex <= pages.length - 1 ? tabIndex : pages.length - 1;
    return pages[index];
  }

  async setViewPortSize(size: { width: number; height: number }, tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    return await page.setViewport(size);
  }

  async navigateWithUrl(url: string, tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    return await page.goto(url);
  }

  async fillInput(selector: string, value: string | number, tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    return await page.type(selector, value.toString());
  }

  async clickForm(selector: string, tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    return await page.click(selector);
  }

  async onShowDialog(callback: (dialog: Dialog) => void, tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    page.on('dialog', callback);
  }

  async waitForTime(time: number, tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    return await page.waitForTimeout(time);
  }

  async waitForNavigation(tabIndex?: number) {
    const page = await this.getFocusedPage(tabIndex);
    return await page.waitForNavigation({ waitUntil: 'load' });
  }
  async cleanPages(remainingTabIndex: number[]) {
    const browser = await this.getBrowser();

    const pages = await browser.pages();

    pages.map((item, index) => {
      if (!remainingTabIndex.includes(index)) {
        item.close();
      }
    });
  }
}
