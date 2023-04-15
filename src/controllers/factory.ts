import { PuppeteerController } from './puppeteer';
import type { BrowserConfigs, BrowserControllerInterface } from '../types';

export function createBrowserController(name: 'puppeteer', configs: BrowserConfigs): BrowserControllerInterface {
  switch (name) {
    case 'puppeteer':
      return new PuppeteerController(configs);
  }
}
