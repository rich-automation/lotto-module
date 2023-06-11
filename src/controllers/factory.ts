import { PuppeteerController } from './puppeteer';
import type { BrowserConfigs, BrowserControllerInterface } from '../types';
import type { LoggerInterface } from '../logger';
import { PlaywrightController } from './playwright';

export function createBrowserController(
  name: 'puppeteer' | 'playwright',
  configs: BrowserConfigs,
  logger: LoggerInterface
): BrowserControllerInterface {
  switch (name) {
    case 'puppeteer':
      return new PuppeteerController(configs, logger);
    case 'playwright':
      return new PlaywrightController(configs, logger);
  }
}
