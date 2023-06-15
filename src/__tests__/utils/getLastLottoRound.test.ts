import { CONST } from '../../constants';
import { getLastLottoRound } from '../../utils/getLastLottoRound';

describe('getLastLottoRound', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 1000 when the current date is before the first lotto round', () => {
    // Set a fixed date for testing purposes
    const fixedDate = new Date(CONST.THOUSAND_ROUND_DATE);
    Date.now = jest.fn(() => fixedDate.getTime());

    const expectedRound = 1000;
    const result = getLastLottoRound();
    expect(result).toEqual(expectedRound);
  });
});
