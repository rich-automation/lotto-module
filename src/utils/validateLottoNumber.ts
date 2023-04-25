import LottoError from '../lottoError';

export const validateLottoNumber = (numbers: number[]) => {
  const isValid =
    numbers
      .filter(number => {
        return typeof number === 'number' && Math.max(number, 45) === 45 && Math.min(number, 1) === 1;
      })
      .filter((number, index) => numbers.indexOf(number) === index)
      .filter(number => Number.isInteger(number)).length === 6;
  if (!isValid) {
    throw LottoError.InvalidLottoNumber();
  }
};
