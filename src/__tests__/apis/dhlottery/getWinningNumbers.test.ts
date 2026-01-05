import { getWinningNumbers } from '../../../apis/dhlottery/getWinningNumbers';
import axios from 'axios';
import LottoError from '../../../lottoError';

jest.mock('axios');
type AxiosMock = jest.MockedFunction<typeof axios.get>;

describe('getWinningNumbers', () => {
  afterAll(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should return an array of winning numbers', async () => {
    const mockData = {
      resultCode: null,
      resultMessage: null,
      data: {
        list: [
          {
            ltEpsd: 1,
            tm1WnNo: 1,
            tm2WnNo: 2,
            tm3WnNo: 3,
            tm4WnNo: 4,
            tm5WnNo: 5,
            tm6WnNo: 6,
            bnsWnNo: 7
          }
        ]
      }
    };

    (axios.get as AxiosMock).mockResolvedValueOnce({ data: mockData });
    const result = await getWinningNumbers(1);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('should throw an InvalidRound error if the round is invalid', async () => {
    const mockData = {
      resultCode: null,
      resultMessage: null,
      data: { list: [] }
    };

    (axios.get as AxiosMock).mockResolvedValueOnce({ data: mockData });
    await expect(getWinningNumbers(0)).rejects.toThrowError(LottoError.InvalidRound());
  });

  it('should throw a NetworkError error if there is a network error', async () => {
    (axios.get as AxiosMock).mockRejectedValueOnce(new Error('network error'));
    await expect(getWinningNumbers(1)).rejects.toThrowError(LottoError.NetworkError());
  });
});
