import axios from 'axios';
import LottoError from '../../lottoError';
import { deferred } from '../../utils/deferred';

export const getWinningNumbers = async (volume: number) => {
  const p = deferred<number[]>();
  try {
    const res = await axios.get<any, any>(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${volume}`
    );
    const data = res.data;
    if (data.returnValue == 'success') {
      p.resolve([data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6, data.bnusNo]);
    } else {
      p.reject(LottoError.InvalidRound());
    }
  } catch {
    p.reject(LottoError.NetworkError());
  }
  return p.promise;
};
