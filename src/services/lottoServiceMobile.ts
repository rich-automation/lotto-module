import type { BrowserControllerInterface } from '../types';
import type { LoggerInterface } from '../logger';
import LottoError from '../lottoError';
import { LottoServiceBase } from './lottoService.base';

/**
 * 모바일용 LottoService stub.
 * LottoServiceBase를 상속하여 check, getCheckWinningLink는 공유하고,
 * 모바일 웹 전용 flow(destroy, signIn, signInWithCookie, purchase)는
 * 추후 모바일 전용 상수 및 셀렉터가 제공되면 구현한다.
 */
export class LottoServiceMobile extends LottoServiceBase {
  constructor(controller: BrowserControllerInterface, logger: LoggerInterface) {
    super(controller, logger);
  }

  /**
   * TODO: 브라우저 리소스 정리
   * - WebView bridge destroy 호출
   * - pending calls 정리
   */
  destroy = async () => {
    throw LottoError.NotSupported('LottoServiceMobile.destroy() is not implemented yet.');
  };

  /**
   * TODO: 모바일 웹 로그인 (ID/PW)
   * - 모바일 로그인 페이지 URL로 이동
   * - 모바일 전용 셀렉터로 ID/PW 입력 및 로그인 버튼 클릭
   * - 로그인 성공/실패 판별 (리다이렉트 URL 또는 에러 팝업 확인)
   * - 성공 시 context.authenticated = true, 쿠키 반환
   *
   * 필요 상수: MOBILE_URLS.LOGIN, MOBILE_SELECTORS.ID_INPUT, MOBILE_SELECTORS.PWD_INPUT, etc.
   */
  signIn = async (_id: string, _password: string): Promise<string> => {
    throw LottoError.NotSupported('LottoServiceMobile.signIn() is not implemented yet.');
  };

  /**
   * TODO: 쿠키 기반 로그인
   * - 쿠키 설정 후 모바일 로그인 페이지로 이동
   * - 자동 로그인 여부 확인 (URL 체크)
   * - 성공 시 context.authenticated = true, 쿠키 반환
   *
   * 필요 상수: MOBILE_URLS.LOGIN
   */
  signInWithCookie = async (_cookies: string): Promise<string> => {
    throw LottoError.NotSupported('LottoServiceMobile.signInWithCookie() is not implemented yet.');
  };

  /**
   * TODO: 로또 자동 구매 (모바일 웹)
   * - 인증 상태 확인
   * - 구매 가능 시간 검증 (validatePurchaseAvailability)
   * - 모바일 구매 페이지로 이동
   * - 자동 선택 → 수량 설정 → 구매 확인
   * - 구매 결과 파싱하여 번호 배열 반환
   *
   * 필요 상수: MOBILE_URLS.LOTTO_645, MOBILE_SELECTORS.PURCHASE_* 계열
   */
  purchase = async (_amount = 5): Promise<number[][]> => {
    throw LottoError.NotSupported('LottoServiceMobile.purchase() is not implemented yet.');
  };
}
