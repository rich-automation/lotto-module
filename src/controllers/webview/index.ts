import type { BrowserConfigs, BrowserControllerInterface, BrowserPageInterface } from '../../types';
import type { LoggerInterface } from '../../logger';
import type { WebViewBridge } from './types';
import { WebViewPage } from './webview.page';

export class WebViewController implements BrowserControllerInterface<WebViewBridge> {
  configs: BrowserConfigs<WebViewBridge>;
  logger: LoggerInterface;
  private page: WebViewPage | null = null;

  constructor(configs: BrowserConfigs<WebViewBridge>, logger: LoggerInterface) {
    this.configs = configs;
    this.logger = logger;
  }

  focus = async (): Promise<BrowserPageInterface> => {
    if (!this.page) {
      this.page = new WebViewPage(this.configs.controller, this.logger);
    }
    return this.page;
  };

  close = async () => {
    this.configs.controller.destroy();
    this.page = null;
  };

  cleanPages = async () => {
    // WebView는 단일 페이지이므로 no-op
    this.logger.debug('[WebViewController]', 'cleanPages is no-op for WebView');
  };
}
