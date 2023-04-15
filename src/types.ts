export interface LottoServiceInterface {
  signIn(id: string, password: string): void;
  purchase(count: number): Promise<number[][]>;
  check(numbers: number[]): Promise<void>;
}

export interface BrowserConfigs {
  headless?: boolean;
  defaultViewport?: {
    width: number;
    height: number;
  };
  args?: string[];
}
export interface BrowserControllerInterface {
  configs: BrowserConfigs;

  focus(pageIndex?: number): Promise<BrowserPageInterface>;
  cleanPages(remainingPageIndex: number[]): Promise<void>;
  close(): Promise<void>;
}

export interface BrowserPageInterface {
  goto(url: string): Promise<void>;
  fill(selector: string, value: string | number): Promise<void>;
  click(selector: string): Promise<void>;
  wait(time: number): Promise<void>;
  wait(type: 'navigation'): Promise<void>;

  on(event: BrowserPageEvents, callback: (...args: any[]) => void): Unsubscribe;
}

export type BrowserPageEvents = 'load' | 'close' | 'dialog';
export type Unsubscribe = () => void;
