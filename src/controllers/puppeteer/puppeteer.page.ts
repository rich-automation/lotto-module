import type { BrowserPageEvents, BrowserPageInterface, FakeDOMElement, StringifiedCookies } from '../../types';
import type { Page } from 'puppeteer';
import { deferred } from '../../utils/deferred';
import { lazyRun } from '../../utils/lazyRun';
import type { LoggerInterface } from '../../logger';

export class PuppeteerPage implements BrowserPageInterface {
  page: Page;
  logger?: LoggerInterface;

  constructor(page: Page, logger?: LoggerInterface) {
    this.page = page;
    this.logger = logger;
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

  async click(selector: string, domDirect = false) {
    if (domDirect) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.page.evaluate(s => document.querySelector(s).click(), selector);
      await this.wait(250);
    } else {
      await this.page.click(selector);
    }
  }

  async select(selector: string, value: string) {
    await this.page.select(selector, value);
  }

  querySelectorAll<T>(selector: string, callback: (elems: FakeDOMElement[]) => T): Promise<T> {
    return this.page.$$eval(selector, callback);
  }

  async exists(selector: string, containsText?: string): Promise<boolean> {
    if (containsText) {
      const elements = await this.page.$$(selector);
      for (const el of elements) {
        const text = await el.evaluate(node => node.textContent);
        if (text?.includes(containsText)) return true;
      }
      return false;
    }
    const element = await this.page.$(selector);
    return element !== null;
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

  async waitForSelector(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }
}
