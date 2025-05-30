import type { BrowserConfigs, BrowserControllerInterface } from '../../types';
import { deferred } from '../../utils/deferred';
import { PuppeteerPage } from './puppeteer.page';
import { CONST } from '../../constants';
import { type LoggerInterface } from '../../logger';
import type { PuppeteerNode, Browser } from 'puppeteer';

export class PuppeteerController implements BrowserControllerInterface<PuppeteerNode> {
  configs: BrowserConfigs<PuppeteerNode>;
  logger: LoggerInterface;
  browser!: Browser;

  constructor(configs: BrowserConfigs<PuppeteerNode>, logger: LoggerInterface) {
    this.configs = configs;
    this.logger = logger;

    configs.controller
      .launch({
        ...this.configs,
        headless: this.configs.headless === true
      })
      .then(async browser => {
        this.browser = browser;
      });
  }

  private getBrowser = async () => {
    const p = deferred<Browser>();

    if (this.browser) {
      p.resolve(this.browser);
    } else {
      let retry = 0;

      const interval = setInterval(() => {
        if (CONST.BROWSER_INIT_RETRY_COUNT < retry) {
          clearInterval(interval);
          p.reject(new Error('Browser is not initialized'));
        } else if (this.browser) {
          clearInterval(interval);
          p.resolve(this.browser);
        }
        retry++;
      }, CONST.BROWSER_INIT_RETRY_TIMEOUT);
    }

    return p.promise;
  };

  focus = async (pageIndex = -1) => {
    const browser = await this.getBrowser();
    const pages = await browser.pages();

    if (pages.length === 0) {
      const page = await browser.newPage();
      return new PuppeteerPage(page, this.logger);
    } else {
      const isWithinRange = Math.max(0, Math.min(pageIndex, pages.length - 1)) === pageIndex;
      const page = pages.at(isWithinRange ? pageIndex : -1);
      if (!page) throw new Error('Page is not found');

      return new PuppeteerPage(page, this.logger);
    }
  };

  close = async () => {
    const browser = await this.getBrowser();
    return browser.close();
  };

  cleanPages = async (remainingPageIndex: number[]) => {
    const browser = await this.getBrowser();
    const pages = await browser.pages();

    const promises = pages.map(async (page, index) => {
      if (!remainingPageIndex.includes(index)) {
        return page.close();
      }
    });

    await Promise.all(promises);
  };
}
