import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export enum LogLevel {
  NONE = -1,
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
  private _logLevel: LogLevel;
  private _prefix: string;

  constructor(logLevel: LogLevel = LogLevel.INFO, prefix = '') {
    this._logLevel = logLevel;
    this._prefix = prefix;
  }

  public setLogLevel(logLevel: LogLevel): void {
    this._logLevel = logLevel;
  }

  public get logLevel(): LogLevel {
    return this._logLevel;
  }

  public error(...args: unknown[]): void {
    if (this._logLevel >= LogLevel.ERROR) {
      console.error(printNow(), this._prefix, ...args);
    }
  }

  public warn(...args: unknown[]): void {
    if (this._logLevel >= LogLevel.WARN) {
      console.warn(printNow(), this._prefix, ...args);
    }
  }

  public info(...args: unknown[]): void {
    if (this._logLevel >= LogLevel.INFO) {
      console.info(printNow(), this._prefix, ...args);
    }
  }

  public debug(...args: unknown[]): void {
    if (this._logLevel >= LogLevel.DEBUG) {
      console.debug(printNow(), this._prefix, ...args);
    }
  }
}

function printNow() {
  return dayjs.tz(Date.now(), 'Asia/Seoul').format('YYYY/MM/DD HH:mm:ss');
}
