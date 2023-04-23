import { CONST } from '../../constants';
import { getCurrentLottoRound } from '../../utils/getCurrentLottoRound';

describe('getCurrentLottoRound', () => {
  it('should return the correct current lotto round', () => {
    // Set a fixed date for testing purposes
    const fixedDate = new Date();

    // Mock global.Date.now() to return a fixed date
    global.Date.now = jest.fn(() => fixedDate) as any;

    const expectedRound = 1064;
    const result = getCurrentLottoRound();
    expect(result).toEqual(expectedRound);
  });

  it('should return 1000 when the current date is before the first lotto round', () => {
    // Set a fixed date for testing purposes
    const fixedDate = new Date(CONST.THOUSAND_ROUND_DATE);
    global.Date.now = jest.fn(() => fixedDate) as any;

    const expectedRound = 1000;
    const result = getCurrentLottoRound();
    expect(result).toEqual(expectedRound);
  });
});
