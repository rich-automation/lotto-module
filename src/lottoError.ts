import { invertObject } from './utils/invertObject';

const BaseErrorCode = {
  NETWORK_ERROR: 100001,
  UNKNOWN_ERROR: 199999
} as const;

const LoginErrorCode = {
  CREDENTIALS_INCORRECT: 200001,
  INVALID_COOKIE: 200002,
  TOO_MANY_WRONG_SIGN_IN: 200003
} as const;

const ErrorCode = { ...BaseErrorCode, ...LoginErrorCode };
const ErrorName = invertObject(ErrorCode);

type ErrorCodeNumber = (typeof ErrorCode)[keyof typeof ErrorCode];

const ErrorMessage: Record<ErrorCodeNumber, string> = {
  [ErrorCode.NETWORK_ERROR]: '네트워크 에러가 발생했습니다.',
  [ErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
  [ErrorCode.CREDENTIALS_INCORRECT]: '아이디 혹은 비밀번호가 일치하지 않습니다.',
  [ErrorCode.INVALID_COOKIE]: '쿠키가 만료됐거나 유효하지 않습니다.',
  [ErrorCode.TOO_MANY_WRONG_SIGN_IN]: '로그인에 너무 많이 실패했습니다. 비밀번호 찾기를 이용하세요.'
};

export default class LottoError extends Error {
  static NetworkError() {
    return new LottoError(ErrorCode.NETWORK_ERROR);
  }
  static UnknownError() {
    return new LottoError(ErrorCode.UNKNOWN_ERROR);
  }
  static CredentialsIncorrect() {
    return new LottoError(ErrorCode.CREDENTIALS_INCORRECT);
  }
  static InvalidCookies() {
    return new LottoError(ErrorCode.INVALID_COOKIE);
  }
  static TooManyWrongSignIn() {
    return new LottoError(ErrorCode.TOO_MANY_WRONG_SIGN_IN);
  }
  static getErrorMessage(code: ErrorCodeNumber) {
    return ErrorMessage[code];
  }

  public code: number;
  constructor(code: ErrorCodeNumber, message?: string) {
    super(ErrorMessage[code] ?? message);
    this.name = ErrorName[code] ?? 'LottoError';
    this.code = code;
  }
}
