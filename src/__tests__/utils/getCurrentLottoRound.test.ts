import { getCurrentLottoRound } from '../../utils/getCurrentLottoRound';

describe('getCurrentLottoRound', () => {
  it('get current round', () => {
    const round = getCurrentLottoRound();
    expect(round).toBe(1063); //before 2023.4.22 20:50
  });
});
