import { validatePurchaseAvailability } from '../../utils/validatePurchaseAvailability';
import LottoError from '../../lottoError';

describe('validatePurchaseAvailability', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('should not throw an error when purchase is available', () => {
    it('sunday 06:00', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sun Apr 30 2023 06:00:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).not.toThrow();
    });
    it('sunday 23:59', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sun Apr 30 2023 23:59:59 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).not.toThrow();
    });
    it('saturday 06:00', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sat Apr 29 2023 06:00:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).not.toThrow();
    });
    it('saturday 20:00', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sat Apr 29 2023 20:00:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).not.toThrow();
    });
  });

  describe('should throw an error when purchase is unavailable', () => {
    it('sunday 05:00', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sun Apr 30 2023 05:00:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).toThrowError(LottoError.PurchaseUnavailable());
    });
    it('monday 00:10', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Mon May 01 2023 00:10:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).toThrowError(LottoError.PurchaseUnavailable());
    });
    it('saturday 05:00', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sat Apr 29 2023 05:00:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).toThrowError(LottoError.PurchaseUnavailable());
    });
    it('saturday 21:00', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('Sat Apr 29 2023 21:00:00 GMT+0900').getTime());
      expect(() => validatePurchaseAvailability()).toThrowError(LottoError.PurchaseUnavailable());
    });
  });
});
