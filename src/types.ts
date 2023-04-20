import type { LogLevel } from './logger';


export interface LottoServiceInterface {
  destroy(): Promise<void>;

  signIn(id: string, password: string): Promise<string>;
  signInWithCookie(cookie: string): Promise<string>;
  purchase(count: number): Promise<number[][]>;
  check(numbers: number[], volume?: number): Promise<{ rank: number; matchedNumbers: number[] }>;
}

export interface BrowserConfigs {
  logLevel?: LogLevel;
  headless?: boolean;
  defaultViewport?: {
    width: number;
    height: number;
  };
  [key: string]: unknown;
  args?: string[];
}
export interface BrowserControllerInterface {
  configs: BrowserConfigs;

  focus(pageIndex?: number): Promise<BrowserPageInterface>;
  cleanPages(remainingPageIndex: number[]): Promise<void>;
  close(): Promise<void>;
}

export interface BrowserPageInterface {
  url(): Promise<string>;
  goto(url: string): Promise<void>;
  fill(selector: string, value: string | number): Promise<void>;
  click(selector: string): Promise<void>;
  wait(time: number): Promise<void>;
  wait(type: 'load'): Promise<void>;
  wait(type: 'idle'): Promise<void>;

  getCookies(): Promise<StringifiedCookies>;
  setCookies(cookies: StringifiedCookies): Promise<void>;

  on(event: BrowserPageEvents, callback: (...args: any[]) => void): Unsubscribe;
}

export type BrowserPageEvents = 'load' | 'close' | 'dialog' | 'response';
export type Unsubscribe = () => void;
export type StringifiedCookies = string;

export type GetWinningNumbersResponseType = {
  returnValue: 'success' | 'fail';
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
};
