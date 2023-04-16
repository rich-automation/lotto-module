import Logger, { LogLevel } from '../logger';

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('setLogLevel', () => {
    it('should set log level', () => {
      const logger = new Logger(LogLevel.ERROR);
      logger.setLogLevel(LogLevel.DEBUG);
      expect(logger.logLevel).toBe(LogLevel.DEBUG);
    });
  });

  describe('error', () => {
    it('should log error messages when log level is ERROR or higher', () => {
      const logger1 = new Logger(LogLevel.ERROR);
      logger1.error('test message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const logger2 = new Logger(LogLevel.WARN);
      logger2.error('test message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      const logger3 = new Logger(LogLevel.INFO);
      logger3.error('test message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);

      const logger4 = new Logger(LogLevel.DEBUG);
      logger4.error('test message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('warn', () => {
    it('should log warning messages when log level is WARN or higher', () => {
      const logger1 = new Logger(LogLevel.WARN);
      logger1.warn('test message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      const logger2 = new Logger(LogLevel.INFO);
      logger2.warn('test message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

      const logger3 = new Logger(LogLevel.DEBUG);
      logger3.warn('test message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });

    it('should not log warning messages when log level is lower than WARN', () => {
      const logger1 = new Logger(LogLevel.ERROR);
      logger1.warn('test message');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info messages when log level is INFO or higher', () => {
      const logger1 = new Logger(LogLevel.INFO);
      logger1.info('test message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      const logger2 = new Logger(LogLevel.DEBUG);
      logger2.info('test message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    });

    it('should not log info messages when log level is lower than INFO', () => {
      const logger1 = new Logger(LogLevel.ERROR);
      logger1.info('test message');
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      const logger2 = new Logger(LogLevel.WARN);
      logger2.info('test message');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages when log level is DEBUG or higher', () => {
      const logger1 = new Logger(LogLevel.DEBUG);
      logger1.debug('test message');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it('should not log debug messages when log level is lower than DEBUG', () => {
      const logger1 = new Logger(LogLevel.ERROR);
      logger1.debug('test message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      const logger2 = new Logger(LogLevel.WARN);
      logger2.debug('test message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      const logger3 = new Logger(LogLevel.INFO);
      logger3.debug('test message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });
});
