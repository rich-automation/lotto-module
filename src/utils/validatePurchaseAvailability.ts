import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import LottoError from '../lottoError';

dayjs.extend(utc);
dayjs.extend(timezone);

const getSeoulTime = () => dayjs.tz(Date.now(), 'Asia/Seoul');
const resetTime = (dayjs: dayjs.Dayjs) => dayjs.hour(0).minute(0).second(0).millisecond(0);

// 평일/일요일: 06:00 ~ 24:00
// 토요일: 06:00 ~ 20:00
export const validatePurchaseAvailability = () => {
  const now = getSeoulTime();
  const isSaturday = now.day() === 6;

  const openingTime = resetTime(getSeoulTime()).hour(6);
  const closingTime = isSaturday ? resetTime(getSeoulTime()).hour(20) : resetTime(getSeoulTime()).hour(24);

  if (now.isBefore(openingTime) || now.isAfter(closingTime)) {
    throw LottoError.PurchaseUnavailable();
  }
};
