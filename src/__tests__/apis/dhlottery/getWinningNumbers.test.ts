import { getWinningNumbers } from '../../../apis/dhlottery/getWinningNumbers';
import axios from 'axios';
import LottoError from '../../../lottoError';

jest.mock('axios');
type AxiosMock = jest.MockedFunction<typeof axios.get>;

describe('getWinningNumbers', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return an array of winning numbers', async () => {
    const mockData = {
      returnValue: 'success',
      drwtNo1: 1,
      drwtNo2: 2,
      drwtNo3: 3,
      drwtNo4: 4,
      drwtNo5: 5,
      drwtNo6: 6,
      bnusNo: 7
    };

    (axios.get as AxiosMock).mockResolvedValueOnce({ data: mockData });
    const result = await getWinningNumbers(1);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('should throw an InvalidRound error if the round is invalid', async () => {
    const mockData = { returnValue: 'fail' };

    (axios.get as AxiosMock).mockResolvedValueOnce({ data: mockData });
    await expect(getWinningNumbers(0)).rejects.toThrowError(LottoError.InvalidRound());
  });

  it('should throw a NetworkError error if there is a network error', async () => {
    (axios.get as AxiosMock).mockRejectedValueOnce(new Error('network error'));
    await expect(getWinningNumbers(1)).rejects.toThrowError(LottoError.NetworkError());
  });
});
