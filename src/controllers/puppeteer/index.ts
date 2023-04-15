import type { BrowserConfigs, BrowserControllerInterface } from '../../types';
import puppeteer, { Browser } from 'puppeteer';
import { deferred } from '../../utils/deferred';
import { PuppeteerPage } from './puppeteer.page';

export class PuppeteerController implements BrowserControllerInterface {
  configs: BrowserConfigs;
  browser!: Browser;

  constructor(configs: BrowserConfigs) {
    this.configs = configs;
    puppeteer.launch(this.configs).then(browser => (this.browser = browser));
  }

  private async getBrowser() {
    const p = deferred<Browser>();

    if (this.browser) {
      p.resolve(this.browser);
    } else {
      let retry = 0;
      const maxRetry = 10;

      const interval = setInterval(() => {
        if (maxRetry < retry) {
          clearInterval(interval);
          p.reject(new Error('Browser is not initialized'));
        } else if (this.browser) {
          clearInterval(interval);
          p.resolve(this.browser);
        }
        retry++;
      }, 1000);
    }

    return p.promise;
  }

  async focus(pageIndex = -1) {
    const browser = await this.getBrowser();
    const pages = await browser.pages();

    if (pages.length === 0) {
      const page = await browser.newPage();
      return new PuppeteerPage(page);
    } else {
      const isWithinRange = Math.max(0, Math.min(pageIndex, pages.length - 1)) === pageIndex;
      const page = pages.at(isWithinRange ? pageIndex : -1)!;
      return new PuppeteerPage(page);
    }
  }

  async close() {
    return this.browser.close();
  }

  async cleanPages(remainingTabIndex: number[]) {
    const browser = await this.getBrowser();
    const pages = await browser.pages();

    const promises = pages.map(async (page, index) => {
      if (!remainingTabIndex.includes(index)) {
        return page.close();
      }
    });

    await Promise.all(promises);
  }
}
