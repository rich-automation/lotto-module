import { PuppeteerPage } from '../../../controllers/puppeteer/puppeteer.page';
import { Page } from 'puppeteer';

describe('PuppeteerPage', () => {
  let mockPage: {
    goto: jest.Mock;
    select: jest.Mock;
    $$eval: jest.Mock;
    setCookie: jest.Mock;
    waitForNavigation: jest.Mock;
    type: jest.Mock;
    click: jest.Mock;
    url: jest.Mock;
    cookies: jest.Mock;
    off: jest.Mock;
    on: jest.Mock;
  };
  let puppeteerPage: PuppeteerPage;

  beforeEach(() => {
    mockPage = {
      url: jest.fn(),
      goto: jest.fn(),
      type: jest.fn(),
      click: jest.fn(),
      select: jest.fn(),
      $$eval: jest.fn(),
      cookies: jest.fn(),
      setCookie: jest.fn(),
      waitForNavigation: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };

    puppeteerPage = new PuppeteerPage(mockPage as unknown as Page);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call page.url() when url() is called', async () => {
    mockPage.url.mockResolvedValue('https://www.example.com');
    const url = await puppeteerPage.url();
    expect(url).toBe('https://www.example.com');
    expect(mockPage.url).toHaveBeenCalled();
  });

  it('should call page.goto() when goto() is called', async () => {
    await puppeteerPage.goto('https://www.example.com');
    expect(mockPage.goto).toHaveBeenCalledWith('https://www.example.com', { waitUntil: 'load' });
  });

  it('should call page.type() when fill() is called', async () => {
    await puppeteerPage.fill('#username', 'John');
    expect(mockPage.type).toHaveBeenCalledWith('#username', 'John');
  });

  it('should call page.click() when click() is called', async () => {
    await puppeteerPage.click('#submit-button');
    expect(mockPage.click).toHaveBeenCalledWith('#submit-button');
  });

  it('should call page.select() when select() is called', async () => {
    await puppeteerPage.select('#dropdown', 'Option 1');
    expect(mockPage.select).toHaveBeenCalledWith('#dropdown', 'Option 1');
  });

  it('should call page.$$eval() when querySelectorAll() is called', async () => {
    const callback = jest.fn();
    await puppeteerPage.querySelectorAll('#list li', callback);
    expect(mockPage.$$eval).toHaveBeenCalledWith('#list li', callback);
  });

  it('should call page.cookies() and return a JSON string when getCookies() is called', async () => {
    mockPage.cookies.mockResolvedValue([
      { name: 'cookie1', value: 'value1' },
      { name: 'cookie2', value: 'value2' }
    ]);
    const cookies = await puppeteerPage.getCookies();
    expect(cookies).toBe('[{"name":"cookie1","value":"value1"},{"name":"cookie2","value":"value2"}]');
    expect(mockPage.cookies).toHaveBeenCalled();
  });

  it('should call page.setCookie() with parsed cookie params when setCookies() is called', async () => {
    const cookieParams = '[{"name":"cookie1","value":"value1"},{"name":"cookie2","value":"value2"}]';
    await puppeteerPage.setCookies(cookieParams);
    expect(mockPage.setCookie).toHaveBeenCalledWith(
      { name: 'cookie1', value: 'value1' },
      { name: 'cookie2', value: 'value2' }
    );
  });

  it('should call page.waitForNavigation() with { waitUntil: "networkidle0" } when wait("idle") is called', async () => {
    await puppeteerPage.wait('idle');
    expect(mockPage.waitForNavigation).toHaveBeenCalledWith({ waitUntil: 'networkidle0' });
  });

  it('should call page.waitForNavigation() with { waitUntil: "load" } when wait("load") is called', async () => {
    await puppeteerPage.wait('load');
    expect(mockPage.waitForNavigation).toHaveBeenCalledWith({ waitUntil: 'load' });
  });

  it('should resolve after 1000ms when wait(1000) is called', async () => {
    const start = Date.now();
    await puppeteerPage.wait(1000);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(1000);
  });

  it('should add a listener to the page', () => {
    const event = 'response';
    const callback = jest.fn();

    const removeListener = puppeteerPage.on(event, callback);
    expect(mockPage.on).toHaveBeenCalledWith(event, callback);
    expect(mockPage.off).not.toHaveBeenCalled();

    removeListener();
    expect(mockPage.off).toHaveBeenCalledWith(event, callback);
  });
});
