import { PuppeteerController } from './puppeteer';
import type { BrowserConfigs, BrowserController, BrowserControllerInterface } from '../types';
import type { LoggerInterface } from '../logger';
import { PlaywrightController } from './playwright';
import type { BrowserType } from 'playwright-core';
import type { PuppeteerNode } from 'puppeteer';
import { APIModeController } from './api';

export function createBrowserController<T extends BrowserController>(
  configs: BrowserConfigs<T>,
  logger: LoggerInterface
): BrowserControllerInterface {
  if (isAPIMode(configs)) {
    return new APIModeController(configs, logger);
  }

  if (isPlaywright(configs)) {
    return new PlaywrightController(configs, logger);
  }

  if (isPuppeteer(configs)) {
    return new PuppeteerController(configs, logger);
  }

  throw new Error('Invalid browser controller');
}

function isAPIMode(configs: BrowserConfigs): configs is BrowserConfigs<'api'> {
  return configs.controller === 'api';
}

function isPlaywright(configs: BrowserConfigs): configs is BrowserConfigs<BrowserType> {
  return typeof configs.controller !== 'string' && 'connectOverCDP' in configs.controller;
}

function isPuppeteer(configs: BrowserConfigs): configs is BrowserConfigs<PuppeteerNode> {
  return typeof configs.controller !== 'string' && 'executablePath' in configs.controller;
}
