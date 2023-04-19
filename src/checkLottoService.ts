import axios from 'axios';
import { CONST } from './constants';
import LottoError from './lottoError';
import type { CheckLottoServiceInterface } from './types';
import { deferred } from './utils/deferred';

const getCurrentVolume = () => {
  const standardDate: Date = new Date(CONST.THOUSAND_VOLUME_DATE);
  const ADDITIONAL_VOLUME = Math.floor((Date.now() - standardDate.valueOf()) / CONST.WEEK_TO_MILLISECOND);
  return 1000 + ADDITIONAL_VOLUME;
};

const getWinningNumbers = async (volume: number) => {
  const p = deferred<number[]>();
  try {
    let res = await axios.get<any, any>(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${volume}`);
    const data = res.data;
    if (data.returnValue == 'success') {
      p.resolve([data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6, data.bnusNo]);
    } else {
      p.reject(LottoError.InvalidVolume());
    }
  } catch {
    p.reject(LottoError.NetworkError());
  }
  return p.promise;
};

const validateLottoNumber = (numbers: number[]) => {
  return (
    numbers
      .filter(number => {
        return typeof number === 'number' && Math.max(number, 45) === 45 && Math.min(number, 1) === 1;
      })
      .filter((number, index) => numbers.indexOf(number) === index).length === 6
  );
};

const checkLottoNumber = async (myNumber: number[], winningNumber: number[]) => {
  const mainWinningNumber = winningNumber.slice(0, 6);
  const bonusNumber = winningNumber.at(-1) ?? -1;

  const setNumbers = myNumber.filter(n => mainWinningNumber.includes(n));
  const matchingNumbersCount = setNumbers.length;

  let rank = 0;
  if (matchingNumbersCount === 6) {
    rank = 1;
  } else if (matchingNumbersCount === 5 && myNumber.includes(bonusNumber)) {
    setNumbers.push(bonusNumber);
    rank = 2;
  } else if (matchingNumbersCount === 5) {
    rank = 3;
  } else if (matchingNumbersCount === 4) {
    rank = 4;
  } else if (matchingNumbersCount === 3) {
    rank = 5;
  }
  return { rank, setNumbers };
};

export const checkoLottoService: CheckLottoServiceInterface = {
  getCurrentVolume,
  getWinningNumbers,
  validateLottoNumber,
  checkLottoNumber
};
