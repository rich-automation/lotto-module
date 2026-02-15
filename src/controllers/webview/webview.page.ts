import type {
  BrowserPageEvents,
  BrowserPageInterface,
  FakeDOMElement,
  StringifiedCookies,
  Unsubscribe
} from '../../types';
import type { LoggerInterface } from '../../logger';
import type { WebViewBridge } from './types';
import { lazyRun } from '../../utils/lazyRun';
import { deferred } from '../../utils/deferred';

export class WebViewPage implements BrowserPageInterface {
  private bridge: WebViewBridge;
  logger?: LoggerInterface;

  constructor(bridge: WebViewBridge, logger?: LoggerInterface) {
    this.bridge = bridge;
    this.logger = logger;
  }

  async url() {
    return this.bridge.getCurrentUrl();
  }

  async goto(url: string, options?: { waitUntil?: 'load' | 'idle' }) {
    await this.bridge.navigateTo(url, options?.waitUntil);
  }

  async fill(selector: string, value: string | number) {
    const result = (await this.bridge.call('fill', [selector, value.toString()])) as { ok: boolean; error?: string };
    if (!result.ok) {
      this.logger?.warn('[WebViewPage]', 'fill failed', result.error);
    }
  }

  async click(selector: string, _domDirect = false) {
    const result = (await this.bridge.call('click', [selector])) as { ok: boolean; error?: string };
    if (!result.ok) {
      this.logger?.warn('[WebViewPage]', 'click failed', result.error);
    }
  }

  async select(selector: string, value: string) {
    const result = (await this.bridge.call('select', [selector, value])) as { ok: boolean; error?: string };
    if (!result.ok) {
      this.logger?.warn('[WebViewPage]', 'select failed', result.error);
    }
  }

  async querySelectorAll<T>(selector: string, callback: (elems: FakeDOMElement[]) => T): Promise<T> {
    const elems = (await this.bridge.call('querySelectorAll', [selector])) as FakeDOMElement[];
    return callback(elems);
  }

  async exists(selector: string, containsText?: string): Promise<boolean> {
    return (await this.bridge.call('exists', [selector, containsText])) as boolean;
  }

  async wait(param: 'idle' | 'load' | number) {
    const p = deferred<void>();

    if (param === 'idle' || param === 'load') {
      // WebView에서는 네비게이션 대기를 직접 지원하지 않으므로 짧은 대기로 대체
      await lazyRun(async () => p.resolve(), 1000);
    }

    if (typeof param === 'number') {
      await lazyRun(async () => p.resolve(), param);
    }

    return p.promise;
  }

  async waitForSelector(selector: string, timeout = 10000) {
    const result = (await this.bridge.call('waitForSelector', [selector, timeout])) as {
      ok: boolean;
      error?: string;
    };
    if (!result.ok) {
      throw new Error(result.error ?? `waitForSelector timeout: ${selector}`);
    }
  }

  async getCookies(): Promise<StringifiedCookies> {
    return (await this.bridge.call('getCookies', [])) as string;
  }

  async setCookies(cookies: StringifiedCookies) {
    await this.bridge.call('setCookies', [cookies]);
  }

  on(_event: BrowserPageEvents, _callback: (...args: unknown[]) => void): Unsubscribe {
    this.logger?.warn('[WebViewPage]', 'on() is not supported in WebView controller');
    return () => {};
  }
}
