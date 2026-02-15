import { WebViewController } from '../../../controllers/webview';
import type { BrowserConfigs } from '../../../types';
import type { WebViewBridge } from '../../../controllers/webview/types';

describe('WebViewController', () => {
  let mockBridge: WebViewBridge;
  let mockLogger: { debug: jest.Mock; info: jest.Mock; warn: jest.Mock; error: jest.Mock };
  let controller: WebViewController;

  beforeEach(() => {
    mockBridge = {
      __type: 'webview',
      call: jest.fn(),
      navigateTo: jest.fn(),
      getCurrentUrl: jest.fn(),
      destroy: jest.fn()
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    const configs = { controller: mockBridge } as BrowserConfigs<WebViewBridge>;
    controller = new WebViewController(configs, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('focus', () => {
    it('should return a WebViewPage instance', async () => {
      const page = await controller.focus();
      expect(page).toBeDefined();
      expect(page.url).toBeDefined();
      expect(page.goto).toBeDefined();
      expect(page.fill).toBeDefined();
      expect(page.click).toBeDefined();
    });

    it('should return the same page instance on subsequent calls', async () => {
      const page1 = await controller.focus();
      const page2 = await controller.focus();
      expect(page1).toBe(page2);
    });
  });

  describe('close', () => {
    it('should call bridge.destroy()', async () => {
      await controller.close();
      expect(mockBridge.destroy).toHaveBeenCalled();
    });

    it('should create a new page after close and focus', async () => {
      const page1 = await controller.focus();
      await controller.close();
      const page2 = await controller.focus();
      expect(page1).not.toBe(page2);
    });
  });

  describe('cleanPages', () => {
    it('should be a no-op', async () => {
      await expect(controller.cleanPages([0])).resolves.not.toThrow();
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });
});
