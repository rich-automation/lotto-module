import type { BrowserConfigs } from '../types';
import { createBrowserController } from '../controllers/factory';
import Logger from '../logger';
import { LottoServiceCore } from './lottoService.core';

export class LottoService extends LottoServiceCore {
  constructor(configs: BrowserConfigs) {
    const logger = new Logger(configs.logLevel, '[LottoService]');
    const controller = createBrowserController(
      {
        defaultViewport: { width: 1080, height: 1024 },
        ...configs
      },
      logger
    );
    super(controller, logger);
  }
}
