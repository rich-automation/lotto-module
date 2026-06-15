import type { BrowserControllerInterface, LottoServiceInterface } from '../types';
import type { LoggerInterface } from '../logger';
import { getLastLottoRound } from '../utils/getLastLottoRound';
import { getNextLottoRound } from '../utils/getNextLottoRound';
import { validateLottoNumber } from '../utils/validateLottoNumber';
import { getWinningNumbers } from '../apis/dhlottery/getWinningNumbers';
import { checkWinning } from '../utils/checkWinning';
import { getCheckWinningLink } from '../utils/getCheckWinningLink';

export abstract class LottoServiceBase implements LottoServiceInterface {
  context = {
    authenticated: false
  };

  browserController: BrowserControllerInterface;
  logger: LoggerInterface;

  constructor(controller: BrowserControllerInterface, logger: LoggerInterface) {
    this.browserController = controller;
    this.logger = logger;
  }

  abstract destroy(): Promise<void>;
  abstract signIn(id: string, password: string): Promise<string>;
  abstract signInWithCookie(cookies: string): Promise<string>;
  abstract purchase(amount?: number): Promise<number[][]>;

  check = async (numbers: number[][], round: number = getLastLottoRound()) => {
    numbers.forEach(number => validateLottoNumber(number));

    this.logger.debug('[check]', 'getWinningNumbers');
    const winningNumbers = await getWinningNumbers(round);

    return numbers.map(game => checkWinning(game, winningNumbers));
  };

  getCheckWinningLink = (numbers: number[][], round = getNextLottoRound()): string => {
    this.logger.debug('[getCheckWinningLink]', 'getCheckWinningLink');
    return getCheckWinningLink(numbers, round);
  };
}
