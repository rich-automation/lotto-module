import { checkoLottoService } from '../checkLottoService';
import LottoError from '../lottoError';
import { LottoService } from '../lottoService';

const seconds = (n: number) => 1000 * n;

describe('checkLottoService', () => {
  it('get current volume', () => {
    const volume = checkoLottoService.getCurrentVolume();
    expect(volume).toBe(1063); //before 2023.4.22 20:50
  });

  it('get winning number', async () => {
    const vol1063Numbers = await checkoLottoService.getWinningNumbers(1063);
    expect(vol1063Numbers).toEqual([3, 6, 22, 23, 24, 38, 30]);

    const vol1000Numbers = await checkoLottoService.getWinningNumbers(1000);
    expect(vol1000Numbers).toEqual([2, 8, 19, 22, 32, 42, 39]);

    const vol1020Numbers = await checkoLottoService.getWinningNumbers(1020);
    expect(vol1020Numbers).toEqual([12, 27, 29, 38, 41, 45, 6]);
  });

  it('lotto number validation check', () => {
    const cases = [
      { case: [1, 2, 3, 4, 5, 6], expect: true },
      { case: [1, 15, 20, 21, 27, 45], expect: true },
      { case: [-1, 2, 3, 4, 5, 6], expect: false },
      { case: [1, 2, 3, 4, 5, 60], expect: false },
      { case: [1, 2, 3, 4, 5], expect: false },
      { case: [1, 2, 3, 4, 5, 1], expect: false }
    ];
    cases.map(i => {
      const isValid = checkoLottoService.validateLottoNumber(i.case);
      expect(isValid).toBe(i.expect);
    });
  });

  it('get winning rank', () => {
    const cases = [
      {
        myNumbers: [1, 2, 3, 4, 5, 6],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 1, setNumbers: [1, 2, 3, 4, 5, 6] }
      },
      {
        myNumbers: [1, 2, 3, 4, 5, 7],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 2, setNumbers: [1, 2, 3, 4, 5, 7] }
      },
      {
        myNumbers: [1, 2, 3, 4, 5, 8],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 3, setNumbers: [1, 2, 3, 4, 5] }
      },
      {
        myNumbers: [1, 2, 3, 4, 8, 9],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 4, setNumbers: [1, 2, 3, 4] }
      },
      {
        myNumbers: [1, 2, 3, 8, 9, 10],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 5, setNumbers: [1, 2, 3] }
      },
      {
        myNumbers: [1, 2, 8, 9, 10, 11],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 0, setNumbers: [1, 2] }
      },
      {
        myNumbers: [1, 8, 9, 10, 11, 12],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 0, setNumbers: [1] }
      },
      {
        myNumbers: [8, 9, 10, 11, 12, 13],
        winningNumbers: [1, 2, 3, 4, 5, 6, 7],
        expect: { rank: 0, setNumbers: [] }
      }
    ];
    cases.map(async i => {
      const result = await checkoLottoService.checkLottoNumber(i.myNumbers, i.winningNumbers);
      expect(result).toEqual(i.expect);
    });
  });

  it(
    'run lotto service check',
    async () => {
      const lottoService = new LottoService();

      const cases = [
        { myNumber: [9, 11, 27, 36, 38, 41], volume: 1061, expect: { rank: 0, setNumbers: [27] } },
        { myNumber: [3, 8, 29, 31, 34, 45], volume: 1060, expect: { rank: 0, setNumbers: [3, 45] } },
        { myNumber: [9, 14, 24, 25, 33, 34], volume: 1059, expect: { rank: 0, setNumbers: [25, 34] } },
        {
          myNumber: [3, 6, 22, 23, 24, 38],
          volume: undefined,
          expect: { rank: 1, setNumbers: [3, 6, 22, 23, 24, 38] }
        },
        { myNumber: [11, 23, 25, 30, 32, 42], volume: 1058, expect: { rank: 2, setNumbers: [11, 23, 25, 30, 32, 42] } },
        { myNumber: [2, 22, 26, 29, 30, 34], volume: 1053, expect: { rank: 3, setNumbers: [22, 26, 29, 30, 34] } },
        { myNumber: [2, 15, 17, 20, 33, 42], volume: 1047, expect: { rank: 4, setNumbers: [2, 20, 33, 42] } },
        { myNumber: [5, 17, 26, 19, 33, 41], volume: 1052, expect: { rank: 5, setNumbers: [5, 17, 26] } },
        { myNumber: [1, 5, 17, 26, 19, 33], volume: 1052, expect: { rank: 5, setNumbers: [5, 17, 26] } }
      ];

      cases.map(async i => {
        const result = await lottoService.check(i.myNumber, i.volume);
        expect(result).toEqual(i.expect);
      });

      //   try {
      //     await lottoService.check([1, 2, 3, 4, 5, 60], 1);
      //   } catch (e) {
      //     expect(e).toEqual(LottoError.InvalidLottoNumber());
      //   }

      try {
        await lottoService.check([1, 2, 3, 4, 5, 6], -1);
      } catch (e) {
        expect(e).toEqual(LottoError.InvalidVolume());
      }
    },
    seconds(30)
  );
});
