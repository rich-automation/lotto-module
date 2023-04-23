import { CONST } from '../constants';

export const getCurrentLottoRound = () => {
  const standardDate = new Date(CONST.THOUSAND_ROUND_DATE);
  const now = new Date(global.Date.now());
  const ADDITIONAL_ROUND = Math.floor((now.getTime() - standardDate.getTime()) / CONST.WEEK_TO_MILLISECOND);
  return 1000 + ADDITIONAL_ROUND;
};
