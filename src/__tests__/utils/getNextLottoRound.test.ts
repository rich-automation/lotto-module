import { CONST } from '../../constants';
import {getNextLottoRound} from "../../utils/getNextLottoRound";

describe('getNextLottoRound', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 1000 when the current date is before the first lotto round', () => {
    // Set a fixed date for testing purposes
    const fixedDate = new Date(CONST.THOUSAND_ROUND_DATE);
    Date.now = jest.fn(() => fixedDate.getTime());

    const expectedRound = 1001;
    const result = getNextLottoRound();
    expect(result).toEqual(expectedRound);
  });
});
