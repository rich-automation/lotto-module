import { LottoServiceCore } from '../../services/lottoService.core';
import { SELECTORS } from '../../constants/selectors';
import { URLS } from '../../constants/urls';
import type { BrowserControllerInterface, BrowserPageInterface } from '../../types';
import type { LoggerInterface } from '../../logger';

const noopLogger: LoggerInterface = {
  error: () => undefined,
  warn: () => undefined,
  info: () => undefined,
  debug: () => undefined
};

type FakePageOptions = {
  /** 로그인 버튼 클릭 후 URL (사이트 리다이렉트 결과) */
  urlAfterLoginClick?: string;
  /** 쿠키 설정 후 로그인 페이지 접속 시 사이트가 보내는 최종 URL */
  urlAfterGotoLogin?: string;
  /** "다음에 변경" 클릭 후 URL */
  urlAfterDefer?: string;
  /** 만료 안내 페이지에 유예 버튼 존재 여부 */
  hasDeferButton?: boolean;
};

const createFakePage = (options: FakePageOptions) => {
  const state = { url: 'about:blank' };
  const clicked: string[] = [];

  const page: BrowserPageInterface = {
    url: async () => state.url,
    goto: async (url: string) => {
      state.url = url;
      if (url === URLS.LOGIN && options.urlAfterGotoLogin) state.url = options.urlAfterGotoLogin;
    },
    fill: async () => undefined,
    click: async (selector: string) => {
      clicked.push(selector);
      if (selector === SELECTORS.LOGIN_BUTTON && options.urlAfterLoginClick) state.url = options.urlAfterLoginClick;
      if (selector === SELECTORS.PASSWORD_EXPIRY_DEFER_BTN && options.urlAfterDefer) state.url = options.urlAfterDefer;
    },
    select: async () => undefined,
    querySelectorAll: async (_selector: string, callback: (elems: never[]) => unknown) => callback([]),
    exists: async (selector: string) =>
      selector === SELECTORS.PASSWORD_EXPIRY_DEFER_BTN && (options.hasDeferButton ?? true),
    wait: async () => undefined,
    waitForSelector: async () => undefined,
    getCookies: async () => '[]',
    setCookies: async () => undefined,
    on: () => () => undefined
  };

  return { page, clicked };
};

const createService = (page: BrowserPageInterface) => {
  const controller: BrowserControllerInterface = {
    configs: { controller: 'playwright' as never },
    focus: async () => page,
    cleanPages: async () => undefined,
    close: async () => undefined
  };

  return new LottoServiceCore(controller, noopLogger);
};

describe('signIn password expiry notice', () => {
  it('만료 안내 페이지로 리다이렉트되면 "다음에 변경"을 눌러 로그인을 완료한다', async () => {
    const { page, clicked } = createFakePage({
      urlAfterLoginClick: URLS.PASSWORD_EXPIRY_NOTICE,
      urlAfterDefer: URLS.MAIN
    });
    const service = createService(page);

    const cookies = await service.signIn('id', 'pwd');

    expect(clicked).toContain(SELECTORS.PASSWORD_EXPIRY_DEFER_BTN);
    expect(cookies).toBe('[]');
  });

  it('만료 안내 페이지가 아니면 유예 버튼을 누르지 않는다', async () => {
    const { page, clicked } = createFakePage({ urlAfterLoginClick: URLS.MAIN });
    const service = createService(page);

    await service.signIn('id', 'pwd');

    expect(clicked).not.toContain(SELECTORS.PASSWORD_EXPIRY_DEFER_BTN);
  });

  it('유예 버튼이 없고 로그인도 안 되면 실패한다', async () => {
    const { page, clicked } = createFakePage({
      urlAfterLoginClick: URLS.PASSWORD_EXPIRY_NOTICE,
      hasDeferButton: false
    });
    const service = createService(page);

    await expect(service.signIn('id', 'pwd')).rejects.toBeDefined();
    expect(clicked).not.toContain(SELECTORS.PASSWORD_EXPIRY_DEFER_BTN);
  });
});

describe('signInWithCookie password expiry notice', () => {
  it('쿠키 로그인이 만료 안내 페이지로 이어지면 "다음에 변경"을 눌러 진행한다', async () => {
    const { page, clicked } = createFakePage({
      urlAfterGotoLogin: URLS.PASSWORD_EXPIRY_NOTICE,
      urlAfterDefer: URLS.MAIN
    });
    const service = createService(page);

    const cookies = await service.signInWithCookie('[]');

    expect(clicked).toContain(SELECTORS.PASSWORD_EXPIRY_DEFER_BTN);
    expect(cookies).toBe('[]');
  });
});
