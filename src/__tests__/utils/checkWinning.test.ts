import { checkWinning } from '../../utils/checkWinning';

describe('checkWinning', () => {
  test('returns correct rank and matchedNumbers for matching all numbers', async () => {
    const myNumber = [1, 2, 3, 4, 5, 6];
    const winningNumbers = [1, 2, 3, 4, 5, 6, 7];

    const result = await checkWinning(myNumber, winningNumbers);

    expect(result.rank).toBe(1);
    expect(result.matchedNumbers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('returns correct rank and matchedNumbers for matching 5 numbers and the bonus number', async () => {
    const myNumber = [1, 2, 3, 4, 5, 6];
    const winningNumbers = [1, 2, 3, 4, 5, 7, 6];

    const result = await checkWinning(myNumber, winningNumbers);

    expect(result.rank).toBe(2);
    expect(result.matchedNumbers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('returns correct rank and matchedNumbers for matching 5 numbers without the bonus number', async () => {
    const myNumber = [1, 2, 3, 4, 5, 6];
    const winningNumbers = [1, 2, 3, 4, 5, 7, 8];

    const result = await checkWinning(myNumber, winningNumbers);

    expect(result.rank).toBe(3);
    expect(result.matchedNumbers).toEqual([1, 2, 3, 4, 5]);
  });

  test('returns correct rank and matchedNumbers for matching 4 numbers', async () => {
    const myNumber = [1, 2, 3, 4, 5, 6];
    const winningNumbers = [1, 2, 3, 4, 7, 8, 5];

    const result = await checkWinning(myNumber, winningNumbers);

    expect(result.rank).toBe(4);
    expect(result.matchedNumbers).toEqual([1, 2, 3, 4]);
  });

  test('returns correct rank and matchedNumbers for matching 3 numbers', async () => {
    const myNumber = [1, 2, 3, 4, 5, 6];
    const winningNumbers = [1, 2, 3, 7, 8, 9, 4];

    const result = await checkWinning(myNumber, winningNumbers);

    expect(result.rank).toBe(5);
    expect(result.matchedNumbers).toEqual([1, 2, 3]);
  });
});
