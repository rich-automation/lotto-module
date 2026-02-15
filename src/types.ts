import type { LogLevel } from './logger';
import type { PuppeteerNode } from 'puppeteer';
import type { BrowserType } from 'playwright-core';
import type { WebViewBridge } from './controllers/webview/types';

export interface LottoServiceInterface {
  destroy(): Promise<void>;

  signIn(id: string, password: string): Promise<string>;

  signInWithCookie(cookie: string): Promise<string>;

  check(numbers: number[][], volume?: number): Promise<{ rank: number; matchedNumbers: number[] }[]>;

  purchase(amount: number): Promise<number[][]>;

  getCheckWinningLink(numbers: number[][], round: number): string;
}

export type BrowserController = PuppeteerNode | BrowserType | WebViewBridge | 'api';
export interface BrowserConfigs<T extends BrowserController = BrowserController> {
  controller: T;
  logLevel?: LogLevel;
  headless?: boolean;
  defaultViewport?: {
    width: number;
    height: number;
  };

  [key: string]: unknown;

  args?: string[];
}

export interface BrowserControllerInterface<T extends BrowserController = BrowserController> {
  configs: BrowserConfigs<T>;

  focus(pageIndex?: number): Promise<BrowserPageInterface>;

  cleanPages(remainingPageIndex: number[]): Promise<void>;

  close(): Promise<void>;
}

export interface BrowserPageInterface {
  url(): Promise<string>;

  goto(url: string, options?: { waitUntil?: 'load' | 'idle' }): Promise<void>;

  fill(selector: string, value: string | number): Promise<void>;
  click(selector: string, domDirect?: boolean): Promise<void>;
  select(selector: string, value: string): Promise<void>;

  querySelectorAll<T>(selector: string, callback: (elems: FakeDOMElement[]) => T): Promise<T>;

  exists(selector: string, containsText?: string): Promise<boolean>;

  wait(time: number): Promise<void>;

  wait(type: 'load'): Promise<void>;

  wait(type: 'idle'): Promise<void>;

  waitForSelector(selector: string, timeout?: number): Promise<void>;

  getCookies(): Promise<StringifiedCookies>;

  setCookies(cookies: StringifiedCookies): Promise<void>;

  on(event: BrowserPageEvents, callback: (...args: any[]) => void): Unsubscribe;
}

export type FakeDOMElement = {
  className: string;
  innerHTML: string;
  children: FakeDOMElement[];
};
export type BrowserPageEvents = 'response';
export type Unsubscribe = () => void;
export type StringifiedCookies = string;

export type GetWinningNumbersResponse = {
  resultCode: string | null;
  resultMessage: string | null;
  data: {
    list: Array<{
      ltEpsd: number;
      tm1WnNo: number;
      tm2WnNo: number;
      tm3WnNo: number;
      tm4WnNo: number;
      tm5WnNo: number;
      tm6WnNo: number;
      bnsWnNo: number;
    }>;
  };
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOTTO_ID: string;
      LOTTO_PWD: string;
      LOTTO_COOKIE: string;
    }
  }
}
