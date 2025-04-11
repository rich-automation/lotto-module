import type { BrowserConfigs, BrowserControllerInterface } from '../../types';
import type { Browser, BrowserContext } from 'playwright';
import { type LoggerInterface } from '../../logger';

export class APIModeController implements BrowserControllerInterface {
  logger: LoggerInterface;
  configs!: BrowserConfigs;
  browser!: Browser;
  context!: BrowserContext;

  constructor(_: BrowserConfigs, logger: LoggerInterface) {
    this.logger = logger;
  }

  focus = async () => {
    throw new Error('APIModeController does not support focus method');
  };

  close = async () => {
    this.logger.warn('APIModeController does not support close method');
  };

  cleanPages = async () => {
    this.logger.warn('APIModeController does not support cleanPages method');
  };
}
