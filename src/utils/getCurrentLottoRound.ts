import { CONST } from '../constants';

export const getCurrentLottoRound = () => {
  const standardDate = new Date(CONST.THOUSAND_ROUND_DATE);
  const ADDITIONAL_ROUND = Math.floor((Date.now() - standardDate.valueOf()) / CONST.WEEK_TO_MILLISECOND);
  return 1000 + ADDITIONAL_ROUND;
};
