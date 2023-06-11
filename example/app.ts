import { LottoService } from '../src/date';
import { LogLevel } from '../src/logger';
// import * as dotenv from 'dotenv';
// dotenv.config();

const { LOTTO_ID = '', LOTTO_PWD = '' } = process.env;
async function run() {
  const lottoService = new LottoService({
    logLevel: LogLevel.DEBUG,
    headless: true,
    slowMo: 100
  });

  const cookies = await lottoService.signIn(LOTTO_ID, LOTTO_PWD);
  console.log(cookies);
}

run();
