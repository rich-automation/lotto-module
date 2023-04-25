import axios from 'axios';
import LottoError from '../../lottoError';
import type { GetWinningNumbersResponse } from '../../types';

export const getWinningNumbers = async (volume: number) => {
  let res;
  try {
    res = await axios.get<GetWinningNumbersResponse>(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${volume}`
    );
  } catch {
    throw LottoError.NetworkError();
  }

  if (res.data.returnValue == 'success') {
    return toOrderedWinningNumbers(res.data);
  } else {
    throw LottoError.InvalidRound();
  }
};
function toOrderedWinningNumbers(data: GetWinningNumbersResponse) {
  return [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6, data.bnusNo];
}
