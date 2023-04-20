import { invertObject } from './utils/invertObject';

const BaseErrorCode = {
  NETWORK_ERROR: 100001,
  UNKNOWN_ERROR: 199999
} as const;

const LoginErrorCode = {
  CREDENTIALS_INCORRECT: 200001,
  INVALID_COOKIE: 200002
} as const;

const LottoCheckErrorCode = {
  INVALID_ROUND: 300001,
  INVALID_LOTTO_NUMBER: 300002
} as const;

const ErrorCode = { ...BaseErrorCode, ...LoginErrorCode, ...LottoCheckErrorCode };
const ErrorName = invertObject(ErrorCode);

type ErrorCodeNumber = (typeof ErrorCode)[keyof typeof ErrorCode];

const ErrorMessage: Record<ErrorCodeNumber, string> = {
  [ErrorCode.NETWORK_ERROR]: '네트워크 에러가 발생했습니다.',
  [ErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
  [ErrorCode.CREDENTIALS_INCORRECT]: '아이디 혹은 비밀번호가 일치하지 않습니다.',
  [ErrorCode.INVALID_COOKIE]: '쿠키가 만료됐거나 유효하지 않습니다.',
  [ErrorCode.INVALID_ROUND]: '로또 회차가 올바르지 않습니다.',
  [ErrorCode.INVALID_LOTTO_NUMBER]: '로또 번호가 올바르지 않습니다.'
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
  static InvalidRound() {
    return new LottoError(ErrorCode.INVALID_ROUND);
  }
  static InvalidLottoNumber() {
    return new LottoError(ErrorCode.INVALID_LOTTO_NUMBER);
  }

  static get code() {
    return ErrorCode;
  }
  static getMessage(code: ErrorCodeNumber) {
    return ErrorMessage[code];
  }
  static getName(code: ErrorCodeNumber) {
    return ErrorName[code];
  }

  public code: number;
  constructor(code: ErrorCodeNumber, message?: string) {
    super(message ?? ErrorMessage[code]);
    this.name = ErrorName[code] ?? 'LottoError';
    this.code = code;
  }
}
