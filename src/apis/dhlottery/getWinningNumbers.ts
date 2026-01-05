import axios from 'axios';
import LottoError from '../../lottoError';
import type { GetWinningNumbersResponse } from '../../types';

export const getWinningNumbers = async (round: number) => {
  let res;
  try {
    res = await axios.get<GetWinningNumbersResponse>(
      `https://dhlottery.co.kr/lt645/selectPstLt645Info.do?srchStrLtEpsd=${round}&srchEndLtEpsd=${round}`
    );
  } catch {
    throw LottoError.NetworkError();
  }

  const item = res.data.data?.list?.[0];
  if (item) {
    return toOrderedWinningNumbers(item);
  } else {
    throw LottoError.InvalidRound();
  }
};

function toOrderedWinningNumbers(data: GetWinningNumbersResponse['data']['list'][0]) {
  return [data.tm1WnNo, data.tm2WnNo, data.tm3WnNo, data.tm4WnNo, data.tm5WnNo, data.tm6WnNo, data.bnsWnNo];
}
