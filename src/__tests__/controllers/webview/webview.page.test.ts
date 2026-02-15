import { WebViewPage } from '../../../controllers/webview/webview.page';
import type { WebViewBridge } from '../../../controllers/webview/types';
import type { LoggerInterface } from '../../../logger';

describe('WebViewPage', () => {
  let mockBridge: {
    call: jest.Mock;
    navigateTo: jest.Mock;
    getCurrentUrl: jest.Mock;
    destroy: jest.Mock;
    __type: 'webview';
  };
  let mockLogger: jest.Mocked<LoggerInterface>;
  let page: WebViewPage;

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

    page = new WebViewPage(mockBridge as unknown as WebViewBridge, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call bridge.getCurrentUrl() when url() is called', async () => {
    mockBridge.getCurrentUrl.mockReturnValue('https://www.example.com');
    const url = await page.url();
    expect(url).toBe('https://www.example.com');
    expect(mockBridge.getCurrentUrl).toHaveBeenCalled();
  });

  it('should call bridge.navigateTo() when goto() is called', async () => {
    await page.goto('https://www.example.com');
    expect(mockBridge.navigateTo).toHaveBeenCalledWith('https://www.example.com', undefined);
  });

  it('should call bridge.navigateTo() with waitUntil option', async () => {
    await page.goto('https://www.example.com', { waitUntil: 'idle' });
    expect(mockBridge.navigateTo).toHaveBeenCalledWith('https://www.example.com', 'idle');
  });

  it('should call bridge.call("fill") when fill() is called', async () => {
    mockBridge.call.mockResolvedValue({ ok: true });
    await page.fill('#username', 'John');
    expect(mockBridge.call).toHaveBeenCalledWith('fill', ['#username', 'John']);
  });

  it('should log warning when fill() fails', async () => {
    mockBridge.call.mockResolvedValue({ ok: false, error: 'Element not found: #missing' });
    await page.fill('#missing', 'value');
    expect(mockLogger.warn).toHaveBeenCalledWith('[WebViewPage]', 'fill failed', 'Element not found: #missing');
  });

  it('should convert numeric value to string when fill() is called', async () => {
    mockBridge.call.mockResolvedValue({ ok: true });
    await page.fill('#amount', 100);
    expect(mockBridge.call).toHaveBeenCalledWith('fill', ['#amount', '100']);
  });

  it('should call bridge.call("click") when click() is called', async () => {
    mockBridge.call.mockResolvedValue({ ok: true });
    await page.click('#submit-button');
    expect(mockBridge.call).toHaveBeenCalledWith('click', ['#submit-button']);
  });

  it('should log warning when click() fails', async () => {
    mockBridge.call.mockResolvedValue({ ok: false, error: 'Element not found: #missing' });
    await page.click('#missing');
    expect(mockLogger.warn).toHaveBeenCalledWith('[WebViewPage]', 'click failed', 'Element not found: #missing');
  });

  it('should call bridge.call("select") when select() is called', async () => {
    mockBridge.call.mockResolvedValue({ ok: true });
    await page.select('#dropdown', 'Option 1');
    expect(mockBridge.call).toHaveBeenCalledWith('select', ['#dropdown', 'Option 1']);
  });

  it('should log warning when select() fails', async () => {
    mockBridge.call.mockResolvedValue({ ok: false, error: 'Element not found: #missing' });
    await page.select('#missing', 'value');
    expect(mockLogger.warn).toHaveBeenCalledWith('[WebViewPage]', 'select failed', 'Element not found: #missing');
  });

  it('should call bridge.call("querySelectorAll") and apply callback', async () => {
    const fakeElems = [{ innerHTML: '1', children: [] }, { innerHTML: '2', children: [] }];
    mockBridge.call.mockResolvedValue(fakeElems);

    const result = await page.querySelectorAll('#list li', elems => elems.map(el => el.innerHTML));
    expect(mockBridge.call).toHaveBeenCalledWith('querySelectorAll', ['#list li']);
    expect(result).toEqual(['1', '2']);
  });

  it('should call bridge.call("exists") when exists() is called', async () => {
    mockBridge.call.mockResolvedValue(true);
    const result = await page.exists('#element');
    expect(mockBridge.call).toHaveBeenCalledWith('exists', ['#element', undefined]);
    expect(result).toBe(true);
  });

  it('should call bridge.call("exists") with containsText', async () => {
    mockBridge.call.mockResolvedValue(false);
    const result = await page.exists('#error', 'wrong password');
    expect(mockBridge.call).toHaveBeenCalledWith('exists', ['#error', 'wrong password']);
    expect(result).toBe(false);
  });

  it('should resolve after delay when wait(number) is called', async () => {
    const start = Date.now();
    await page.wait(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });

  it('should resolve after fallback delay when wait("idle") is called', async () => {
    const start = Date.now();
    await page.wait('idle');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(900);
  });

  it('should resolve after fallback delay when wait("load") is called', async () => {
    const start = Date.now();
    await page.wait('load');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(900);
  });

  it('should call bridge.call("waitForSelector") when waitForSelector() is called', async () => {
    mockBridge.call.mockResolvedValue({ ok: true });
    await page.waitForSelector('#target', 5000);
    expect(mockBridge.call).toHaveBeenCalledWith('waitForSelector', ['#target', 5000]);
  });

  it('should use default timeout of 10000ms when not specified', async () => {
    mockBridge.call.mockResolvedValue({ ok: true });
    await page.waitForSelector('#target');
    expect(mockBridge.call).toHaveBeenCalledWith('waitForSelector', ['#target', 10000]);
  });

  it('should throw when waitForSelector fails', async () => {
    mockBridge.call.mockResolvedValue({ ok: false, error: 'timeout' });
    await expect(page.waitForSelector('#target', 1000)).rejects.toThrow('timeout');
  });

  it('should throw fallback error message when waitForSelector fails without error property', async () => {
    mockBridge.call.mockResolvedValue({ ok: false });
    await expect(page.waitForSelector('#target')).rejects.toThrow('waitForSelector timeout: #target');
  });

  it('should call bridge.call("getCookies") when getCookies() is called', async () => {
    mockBridge.call.mockResolvedValue('cookie1=value1; cookie2=value2');
    const cookies = await page.getCookies();
    expect(cookies).toBe('cookie1=value1; cookie2=value2');
    expect(mockBridge.call).toHaveBeenCalledWith('getCookies', []);
  });

  it('should call bridge.call("setCookies") when setCookies() is called', async () => {
    await page.setCookies('cookie1=value1');
    expect(mockBridge.call).toHaveBeenCalledWith('setCookies', ['cookie1=value1']);
  });

  it('should return no-op unsubscribe when on() is called', () => {
    const callback = jest.fn();
    const unsubscribe = page.on('response', callback);
    expect(typeof unsubscribe).toBe('function');
    // Should not throw
    unsubscribe();
  });

  it('should log warning when on() is called', () => {
    page.on('response', jest.fn());
    expect(mockLogger.warn).toHaveBeenCalledWith('[WebViewPage]', 'on() is not supported in WebView controller');
  });
});
