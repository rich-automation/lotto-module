import { PuppeteerController } from './puppeteer';
import type { BrowserConfigs, BrowserControllerInterface } from '../types';
import type { LoggerInterface } from '../logger';

export function createBrowserController(
  name: 'puppeteer',
  configs: BrowserConfigs,
  logger: LoggerInterface
): BrowserControllerInterface {
  switch (name) {
    case 'puppeteer':
      return new PuppeteerController(configs, logger);
  }
}
