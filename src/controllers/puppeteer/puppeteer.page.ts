import type { BrowserPageEvents, BrowserPageInterface } from '../../types';
import { Page } from 'puppeteer';
import { deferred } from '../../utils/deferred';

export class PuppeteerPage implements BrowserPageInterface {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'load' });
  }
  async fill(selector: string, value: string | number) {
    await this.page.type(selector, value.toString());
  }
  async click(selector: string) {
    await this.page.click(selector);
  }

  async wait(param: 'navigation' | number) {
    const p = deferred<void>();

    if (param === 'navigation') {
      await this.page.waitForNavigation({ waitUntil: 'load' });
      p.resolve();
    }

    if (typeof param === 'number') {
      setTimeout(() => p.resolve(), param);
    }

    return p.promise;
  }

  on(event: BrowserPageEvents, callback: (...args: unknown[]) => void) {
    this.page.on(event, callback);
    return () => this.page.off(event, callback);
  }
}
