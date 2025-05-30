import type { LogLevel } from './logger';
import type { PuppeteerNode } from 'puppeteer';
import type { BrowserType } from 'playwright-core';

export interface LottoServiceInterface {
  destroy(): Promise<void>;

  signIn(id: string, password: string): Promise<string>;

  signInWithCookie(cookie: string): Promise<string>;

  check(numbers: number[][], volume?: number): Promise<{ rank: number; matchedNumbers: number[] }[]>;

  purchase(amount: number): Promise<number[][]>;

  getCheckWinningLink(numbers: number[][], round: number): string;
}

export type BrowserController = PuppeteerNode | BrowserType | 'api';
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

  goto(url: string): Promise<void>;

  fill(selector: string, value: string | number): Promise<void>;
  click(selector: string, domDirect?: boolean): Promise<void>;
  select(selector: string, value: string): Promise<void>;

  querySelectorAll<T>(selector: string, callback: (elems: FakeDOMElement[]) => T): Promise<T>;

  wait(time: number): Promise<void>;

  wait(type: 'load'): Promise<void>;

  wait(type: 'idle'): Promise<void>;

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
  returnValue: 'success' | 'fail';
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
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
