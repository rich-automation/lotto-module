import { validateLottoNumber } from '../../utils/validateLottoNumber';

describe('validateLottoNumber', () => {
  it('should return true if the numbers are valid', () => {
    expect(validateLottoNumber([1, 2, 3, 4, 5, 6])).toBe(true);
    expect(validateLottoNumber([45, 44, 43, 42, 41, 40])).toBe(true);
    expect(validateLottoNumber([1, 2, 3, 4, 5, 45])).toBe(true);
  });

  it('should return false if the numbers are not valid', () => {
    expect(validateLottoNumber([0, 2, 3, 4, 5, 6])).toBe(false);
    expect(validateLottoNumber([1, 2, 3, 4, 5])).toBe(false);
    expect(validateLottoNumber([1, 2, 3, 4, 5, 6, 7])).toBe(false);
    expect(validateLottoNumber([1, 2, 3, 3, 4, 5])).toBe(false);
  });
});
