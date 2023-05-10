import { URLS } from '../constants/urls';

export function getCheckWinningLink(round: number, numbers: number[][]): string {
  const nums = numbers.map(it => 'q' + it.map(n => String(n).padStart(2, '0')).join('')).join('');
  return `${URLS.CHECK_WINNING}?method=winQr&v=${round}${nums}`;
}
