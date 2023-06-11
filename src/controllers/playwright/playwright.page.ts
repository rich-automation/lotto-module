import type { BrowserPageEvents, BrowserPageInterface, FakeDOMElement, StringifiedCookies } from '../../types';
import type { Page } from 'playwright-core';
import { deferred } from '../../utils/deferred';
import { lazyRun } from '../../utils/lazyRun';
import type { LoggerInterface } from '../../logger';
import type { BrowserContext } from 'playwright';

export class PlaywrightPage implements BrowserPageInterface {
  context: BrowserContext;
  page: Page;
  logger?: LoggerInterface;

  constructor(context: BrowserContext, page: Page, logger?: LoggerInterface) {
    this.context = context;
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
    await this.page.selectOption(selector, value);
  }

  querySelectorAll<T>(selector: string, callback: (elems: FakeDOMElement[]) => T): Promise<T> {
    return this.page.$$eval(selector, callback);
  }

  async getCookies() {
    const cookies = await this.context.cookies();
    return JSON.stringify(cookies);
  }

  async setCookies(cookies: StringifiedCookies) {
    const cookieParams = JSON.parse(cookies);
    await this.context.addCookies(cookieParams);
  }

  async wait(param: 'idle' | 'load' | number) {
    const p = deferred<void>();

    if (param === 'idle') {
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
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
