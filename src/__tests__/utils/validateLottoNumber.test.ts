import LottoError from '../../lottoError';
import { validateLottoNumber } from '../../utils/validateLottoNumber';

describe('validateLottoNumber', () => {
  it('should throw an error when there are less than 6 valid numbers', () => {
    expect(() => validateLottoNumber([1, 2, 3, 4])).toThrow(LottoError.InvalidLottoNumber());
  });

  it('should throw an error when there are more than 6 valid numbers', () => {
    expect(() => validateLottoNumber([1, 2, 3, 4, 5, 6, 7])).toThrow(LottoError.InvalidLottoNumber());
  });

  it('should throw an error when there are duplicate numbers', () => {
    expect(() => validateLottoNumber([1, 2, 3, 4, 4, 5])).toThrow(LottoError.InvalidLottoNumber());
  });

  it('should throw an error when the numbers are not between 1 and 45', () => {
    expect(() => validateLottoNumber([0, 1, 2, 3, 4, 46])).toThrow(LottoError.InvalidLottoNumber());
  });

  it('should throw an error when the numbers are not integers', () => {
    expect(() => validateLottoNumber([1.5, 2, 3, 4, 5, 6])).toThrow(LottoError.InvalidLottoNumber());
  });

  it('should not throw an error when there are 6 valid numbers', () => {
    expect(() => validateLottoNumber([1, 2, 3, 4, 5, 6])).not.toThrow();
  });
});
