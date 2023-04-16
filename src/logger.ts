import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}
export interface LoggerInterface {
  setLogLevel(logLevel: LogLevel): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

export default class Logger implements LoggerInterface {
  private logLevel: LogLevel;
  private prefix: string;

  constructor(logLevel: LogLevel = LogLevel.INFO, prefix = '') {
    this.logLevel = logLevel;
    this.prefix = prefix;
  }

  public setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
  }

  public error(...args: unknown[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(printNow(), this.prefix, ...args);
    }
  }

  public warn(...args: unknown[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(printNow(), this.prefix, ...args);
    }
  }

  public info(...args: unknown[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(printNow(), this.prefix, ...args);
    }
  }

  public debug(...args: unknown[]): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.debug(printNow(), this.prefix, ...args);
    }
  }
}

function printNow() {
  return dayjs.tz(Date.now(), 'Asia/Seoul').format('YYYY/MM/DD HH:mm:ss');
}
