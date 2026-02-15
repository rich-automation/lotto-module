import type { BrowserConfigs, BrowserControllerInterface, LottoServiceInterface } from './types';
import LottoError from './lottoError';
import { SELECTORS } from './constants/selectors';
import { createBrowserController } from './controllers/factory';
import { URLS } from './constants/urls';
import { CONST } from './constants';
import { lazyRun } from './utils/lazyRun';
import Logger, { type LoggerInterface } from './logger';
import { getLastLottoRound } from './utils/getLastLottoRound';
import { validateLottoNumber } from './utils/validateLottoNumber';
import { getWinningNumbers } from './apis/dhlottery/getWinningNumbers';
import { checkWinning } from './utils/checkWinning';
import { validatePurchaseAvailability } from './utils/validatePurchaseAvailability';
import { getCheckWinningLink } from './utils/getCheckWinningLink';
import { getNextLottoRound } from './utils/getNextLottoRound';

export class LottoService implements LottoServiceInterface {
  context = {
    authenticated: false
  };

  browserController: BrowserControllerInterface;
  logger: LoggerInterface;

  constructor(configs: BrowserConfigs) {
    this.logger = new Logger(configs.logLevel, '[LottoService]');
    this.browserController = createBrowserController(
      {
        defaultViewport: { width: 1080, height: 1024 },
        ...configs
      },
      this.logger
    );
  }

  destroy = async () => {
    if (this.browserController.configs.controller === 'api') {
      throw LottoError.NotSupported('API mode does not support destroy.');
    }

    return lazyRun(this.browserController.close, CONST.BROWSER_DESTROY_SAFE_TIMEOUT);
  };

  signInWithCookie = async (cookies: string) => {
    if (this.browserController.configs.controller === 'api') {
      throw LottoError.NotSupported('API mode does not support signInWithCookie.');
    }

    // 쿠키 설정 & 페이지 이동
    const page = await this.browserController.focus(0);
    this.logger.debug('[signInWithCookie]', 'setCookies');
    await page.setCookies(cookies);
    this.logger.debug('[signInWithCookie]', 'goto', 'login page');
    await page.goto(URLS.LOGIN);
    this.logger.debug('[signInWithCookie]', 'page url', await page.url());

    // 팝업 제거용
    this.logger.debug('[signInWithCookie]', 'clear popups');
    await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
    await this.browserController.cleanPages([0]);

    // 로그인이 되지 않았으면 에러처리
    if (URLS.LOGIN === (await page.url())) {
      this.logger.info('[signInWithCookie]', 'failure');
      throw LottoError.InvalidCookies();
    }

    this.logger.info('[signInWithCookie]', 'success');
    this.context.authenticated = true;
    return page.getCookies();
  };

  signIn = async (id: string, password: string) => {
    if (this.browserController.configs.controller === 'api') {
      throw LottoError.NotSupported('API mode does not support signIn.');
    }

    // 페이지 이동 (RSA 키 로딩 등 비동기 스크립트 완료까지 대기)
    const page = await this.browserController.focus(0);
    this.logger.debug('[signIn]', 'goto', 'login page');
    await page.goto(URLS.LOGIN, { waitUntil: 'idle' });
    this.logger.debug('[signIn]', 'page url', await page.url());

    // 로그인 시도
    this.logger.debug('[signIn]', 'try login');
    await page.fill(SELECTORS.ID_INPUT, id);
    await page.fill(SELECTORS.PWD_INPUT, password);
    await page.click(SELECTORS.LOGIN_BUTTON);

    // 결과 대기
    await page.wait(CONST.BROWSER_LOGIN_WAIT);

    // 결과 확인
    const currentUrl = await page.url();

    // 성공: MAIN URL로 이동됨
    if (currentUrl.includes(URLS.MAIN)) {
      this.logger.info('[signIn]', 'success');
      this.context.authenticated = true;

      this.logger.debug('[signIn]', 'clear popups');
      await page.wait(CONST.BROWSER_PAGE_POPUP_WAIT);
      await this.browserController.cleanPages([0]);

      return page.getCookies();
    }

    // 디버깅 정보 수집
    const debugInfo = {
      currentUrl,
      isStillOnLoginPage: currentUrl.includes(URLS.LOGIN),
      hasErrorPopup: await page.exists(SELECTORS.LOGIN_ERROR_POPUP),
      hasLoginButton: await page.exists(SELECTORS.LOGIN_BUTTON),
      hasIdInput: await page.exists(SELECTORS.ID_INPUT),
      errorPopupMessage: null as string | null
    };

    // 에러 팝업 메시지 추출 시도
    if (debugInfo.hasErrorPopup) {
      try {
        const messages = await page.querySelectorAll(SELECTORS.LOGIN_ERROR_POPUP, elems =>
          elems.map(el => el.innerHTML.replace(/<[^>]*>/g, ' ').trim())
        );
        debugInfo.errorPopupMessage = messages.join(' | ');
      } catch {
        debugInfo.errorPopupMessage = '[failed to extract]';
      }
    }

    // 실패: 로그인 에러 팝업 확인
    if (await page.exists(SELECTORS.LOGIN_ERROR_POPUP, CONST.LOGIN_ERROR_MESSAGE)) {
      this.logger.info('[signIn]', 'failed', 'credentials incorrect', debugInfo);
      throw LottoError.CredentialsIncorrect();
    }

    // 기타 실패
    this.logger.warn('[signIn]', 'failed', 'unknown reason', debugInfo);
    throw LottoError.CredentialsIncorrect();
  };

  purchase = async (amount = 5) => {
    if (this.browserController.configs.controller === 'api') {
      throw LottoError.NotSupported('API mode does not support purchase.');
    }

    if (!this.context.authenticated) throw LottoError.NotAuthenticated();
    this.logger.debug('[purchase]', 'validatePurchaseAvailability');
    validatePurchaseAvailability();

    // move
    this.logger.debug('[purchase]', 'move to lotto game page');
    const page = await this.browserController.focus(0);
    await page.goto(URLS.LOTTO_645);

    // remove alert in linux env (비정상적인 방법으로 접속)
    if (process.env.CI) {
      this.logger.debug('[purchase]', 'click environment alert confirm');
      await page.click(SELECTORS.ENVIRONMENT_ALERT_CONFIRM);
    }

    // click auto button
    this.logger.debug('[purchase]', 'click purchase type button -> auto');
    await page.click(SELECTORS.PURCHASE_TYPE_RANDOM_BTN);

    // set and confirm amount
    const amountString = String(Math.max(1, Math.min(5, amount)));
    this.logger.debug('[purchase]', `select purchase amount(${amountString}) -> amount confirm`);
    await page.select(SELECTORS.PURCHASE_AMOUNT_SELECT, amountString);
    await page.click(SELECTORS.PURCHASE_AMOUNT_CONFIRM_BTN);

    // click purchase button
    this.logger.debug('[purchase]', 'click purchase button');
    await page.click(SELECTORS.PURCHASE_BTN);

    this.logger.debug('[purchase]', 'click purchase confirm button');
    await page.click(SELECTORS.PURCHASE_CONFIRM_BTN);

    this.logger.debug('[purchase]', 'wait for purchase result');
    try {
      await page.waitForSelector(SELECTORS.PURCHASE_NUMBER_LIST, 5000);
    } catch (e) {
      this.logger.error('[purchase]', 'failed to wait for purchase result selector', SELECTORS.PURCHASE_NUMBER_LIST, e);
      throw LottoError.PurchaseFailed('구매 결과 로딩 타임아웃');
    }

    // game result
    const result = await page.querySelectorAll(SELECTORS.PURCHASE_NUMBER_LIST, elems => {
      return elems.map(it => Array.from(it.children).map(child => Number(child.innerHTML)));
    });
    this.logger.debug('[purchase]', 'print result', result);

    if (result.length === 0 || result.some(nums => nums.length === 0)) {
      this.logger.error('[purchase]', 'failed to parse purchase result', {
        selector: SELECTORS.PURCHASE_NUMBER_LIST,
        result
      });
      throw LottoError.PurchaseFailed('구매 결과 파싱 실패');
    }

    return result;
  };

  check = async (numbers: number[][], round: number = getLastLottoRound()) => {
    numbers.forEach(number => validateLottoNumber(number));

    this.logger.debug('[check]', 'getWinningNumbers');
    const winningNumbers = await getWinningNumbers(round);

    return numbers.map(game => checkWinning(game, winningNumbers));
  };

  getCheckWinningLink = (numbers: number[][], round = getNextLottoRound()): string => {
    this.logger.debug('[getCheckWinningLink]', 'getCheckWinningLink');
    return getCheckWinningLink(numbers, round);
  };
}
