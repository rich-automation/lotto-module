import { getCheckWinningLink } from '../../utils/getCheckWinningLink';

describe('getCheckWinningLink', () => {
  it('should return a link with the given round and numbers', () => {
    const link = getCheckWinningLink(
      [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12]
      ],
      1000
    );
    expect(link).toEqual('https://dhlottery.co.kr/qr.do?method=winQr&v=1000q010203040506q070809101112');
  });
});
