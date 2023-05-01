import type { BrowserPageEvents, BrowserPageInterface, FakeDOMElement, StringifiedCookies } from '../../types';
import { Page } from 'puppeteer';
import { deferred } from '../../utils/deferred';
import { lazyRun } from '../../utils/lazyRun';

export class PuppeteerPage implements BrowserPageInterface {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async url() {
    return this.page.url();
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

  async select(selector: string, value: string) {
    await this.page.select(selector, value);
  }

  querySelectorAll<T>(selector: string, callback: (elems: FakeDOMElement[]) => T): Promise<T> {
    return this.page.$$eval(selector, callback);
  }

  async getCookies() {
    const cookies = await this.page.cookies();
    return JSON.stringify(cookies);
  }

  async setCookies(cookies: StringifiedCookies) {
    const cookieParams = JSON.parse(cookies);
    await this.page.setCookie(...cookieParams);
  }

  async wait(param: 'idle' | 'load' | number) {
    const p = deferred<void>();

    if (param === 'idle') {
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      p.resolve();
    }

    if (param === 'load') {
      await this.page.waitForNavigation({ waitUntil: 'load' });
      p.resolve();
    }

    if (typeof param === 'number') {
      await lazyRun(async () => p.resolve(), param);
    }

    return p.promise;
  }

  on(event: BrowserPageEvents, callback: (...args: unknown[]) => void) {
    this.page.on(event, callback);
    return () => this.page.off(event, callback);
  }
}
