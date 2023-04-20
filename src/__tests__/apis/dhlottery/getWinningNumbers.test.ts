import { getWinningNumbers } from '../../../apis/dhlottery/getWinningNumbers';
import axios from 'axios';
import LottoError from '../../../lottoError';

jest.mock('axios');

describe('getWinningNumbers', () => {
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

    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce({
      data: mockData
    }); // mock the axios get method to return the mock data
    const result = await getWinningNumbers(1);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]); // verify the result
  });

  it('should throw an InvalidRound error if the round is invalid', async () => {
    const mockData = {
      returnValue: 'fail'
    };
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce({
      data: mockData
    }); // mock the axios get method to return the mock data
    await expect(getWinningNumbers(0)).rejects.toThrowError(LottoError.InvalidRound()); // verify the error
  });

  it('should throw a NetworkError error if there is a network error', async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValueOnce(new Error('network error')); // mock the axios get method to throw an error
    await expect(getWinningNumbers(1)).rejects.toThrowError(LottoError.NetworkError()); // verify the error
  });
});
