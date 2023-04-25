import LottoError from '../lottoError';

describe('LottoError', () => {
  describe('static methods', () => {
    it('should return LottoError with NETWORK_ERROR when NetworkError is called', () => {
      const error = LottoError.NetworkError();
      expect(error.code).toBe(LottoError.code.NETWORK_ERROR);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.NETWORK_ERROR));
      expect(error.name).toBe(LottoError.getName(LottoError.code.NETWORK_ERROR));
    });

    it('should return LottoError with UNKNOWN_ERROR when UnknownError is called', () => {
      const error = LottoError.UnknownError();
      expect(error.code).toBe(LottoError.code.UNKNOWN_ERROR);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.UNKNOWN_ERROR));
      expect(error.name).toBe(LottoError.getName(LottoError.code.UNKNOWN_ERROR));
    });

    it('should return LottoError with CREDENTIALS_INCORRECT when CredentialsIncorrect is called', () => {
      const error = LottoError.CredentialsIncorrect();

      expect(error.code).toBe(LottoError.code.CREDENTIALS_INCORRECT);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.CREDENTIALS_INCORRECT));
      expect(error.name).toBe(LottoError.getName(LottoError.code.CREDENTIALS_INCORRECT));
    });

    it('should return LottoError with INVALID_COOKIE when InvalidCookies is called', () => {
      const error = LottoError.InvalidCookies();

      expect(error.code).toBe(LottoError.code.INVALID_COOKIE);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.INVALID_COOKIE));
      expect(error.name).toBe(LottoError.getName(LottoError.code.INVALID_COOKIE));
    });

    it('should return LottoError with INVALID_ROUND when InvalidRound is called', () => {
      const error = LottoError.InvalidRound();

      expect(error.code).toBe(LottoError.code.INVALID_ROUND);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.INVALID_ROUND));
      expect(error.name).toBe(LottoError.getName(LottoError.code.INVALID_ROUND));
    });

    it('should return LottoError with INVALID_LOTTO_NUMBER when InvalidLottoNumber is called', () => {
      const error = LottoError.InvalidLottoNumber();

      expect(error.code).toBe(LottoError.code.INVALID_LOTTO_NUMBER);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.INVALID_LOTTO_NUMBER));
      expect(error.name).toBe(LottoError.getName(LottoError.code.INVALID_LOTTO_NUMBER));
    });
  });

  describe('constructor', () => {
    it('should set correct error code and message when provided code is valid', () => {
      const error = new LottoError(LottoError.code.NETWORK_ERROR, 'Test error message');
      expect(error.code).toBe(LottoError.code.NETWORK_ERROR);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe(LottoError.getName(LottoError.code.NETWORK_ERROR));
    });

    it('should set default error message when provided code is valid but message is not provided', () => {
      const error = new LottoError(LottoError.code.NETWORK_ERROR);
      expect(error.code).toBe(LottoError.code.NETWORK_ERROR);
      expect(error.message).toBe(LottoError.getMessage(LottoError.code.NETWORK_ERROR));
      expect(error.name).toBe(LottoError.getName(LottoError.code.NETWORK_ERROR));
    });
  });
});
