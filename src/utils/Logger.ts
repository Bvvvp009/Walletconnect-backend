import { Logger } from '../types';

export class DefaultLogger implements Logger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  constructor(logLevel?: 'debug' | 'info' | 'warn' | 'error') {
    if (logLevel) {
      this.logLevel = logLevel;
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: string, message: string, args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, args));
    }
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  getLogLevel(): string {
    return this.logLevel;
  }
}

export class FileLogger implements Logger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';
  private logFile: string;
  private fs: any;

  constructor(logFile: string, logLevel?: 'debug' | 'info' | 'warn' | 'error') {
    this.logFile = logFile;
    if (logLevel) {
      this.logLevel = logLevel;
    }
    
    // Dynamic import for fs to avoid issues in browser environments
    try {
      this.fs = require('fs').promises;
    } catch (error) {
      console.warn('File system not available, falling back to console logging');
      this.fs = null;
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: string, message: string, args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}\n`;
  }

  private async writeToFile(logMessage: string): Promise<void> {
    if (this.fs) {
      try {
        await this.fs.appendFile(this.logFile, logMessage);
      } catch (error) {
        console.error('Failed to write to log file:', error);
        console.log(logMessage.trim());
      }
    } else {
      console.log(logMessage.trim());
    }
  }

  async debug(message: string, ...args: any[]): Promise<void> {
    if (this.shouldLog('debug')) {
      const logMessage = this.formatMessage('debug', message, args);
      await this.writeToFile(logMessage);
    }
  }

  async info(message: string, ...args: any[]): Promise<void> {
    if (this.shouldLog('info')) {
      const logMessage = this.formatMessage('info', message, args);
      await this.writeToFile(logMessage);
    }
  }

  async warn(message: string, ...args: any[]): Promise<void> {
    if (this.shouldLog('warn')) {
      const logMessage = this.formatMessage('warn', message, args);
      await this.writeToFile(logMessage);
    }
  }

  async error(message: string, ...args: any[]): Promise<void> {
    if (this.shouldLog('error')) {
      const logMessage = this.formatMessage('error', message, args);
      await this.writeToFile(logMessage);
    }
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  getLogLevel(): string {
    return this.logLevel;
  }
}

export class SilentLogger implements Logger {
  debug(message: string, ...args: any[]): void {}
  info(message: string, ...args: any[]): void {}
  warn(message: string, ...args: any[]): void {}
  error(message: string, ...args: any[]): void {}
} 