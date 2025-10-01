/**
 * Production-ready logging utility
 * - In development: logs everything
 * - In production: only logs errors and critical information
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log informational messages (development only)
   */
  info(message: string, data?: LogData) {
    if (!this.isProduction) {
      console.log(`ℹ️ [INFO] ${message}`, data || '');
    }
  }

  /**
   * Log warning messages (always logged)
   */
  warn(message: string, data?: LogData) {
    console.warn(`⚠️ [WARN] ${message}`, data || '');
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: any, data?: LogData) {
    console.error(`❌ [ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...data,
    });
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: LogData) {
    if (!this.isProduction) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log critical errors that should always be tracked (always logged)
   */
  critical(message: string, error?: any, data?: LogData) {
    console.error(`🚨 [CRITICAL] ${message}`, {
      timestamp: new Date().toISOString(),
      error: error?.message || error,
      stack: error?.stack,
      ...data,
    });
  }
}

export const logger = new Logger();
