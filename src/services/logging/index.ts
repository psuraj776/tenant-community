/**
 * Logging Service
 * Structured logging with correlation IDs for observability
 */

import {generateId} from '@utils';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  correlationId?: string;
  userId?: string;
  context?: Record<string, any>;
  error?: Error;
}

class LoggingService {
  private correlationId: string | null = null;
  private userId: string | null = null;
  private enableConsole: boolean = true;
  private enableRemote: boolean = false;

  /**
   * Set correlation ID for request tracking
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Generate and set new correlation ID
   */
  generateCorrelationId(): string {
    const id = generateId();
    this.setCorrelationId(id);
    return id;
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId(): void {
    this.correlationId = null;
  }

  /**
   * Set user ID for logging
   */
  setUserId(id: string | null): void {
    this.userId = id;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId || undefined,
      userId: this.userId || undefined,
      context: this.sanitizeContext(context),
      error,
    };
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized = {...context};
    const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'otp', 'pin'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Log to console (development)
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.enableConsole) return;

    const logFn = entry.level === LogLevel.ERROR ? console.error : console.log;

    if (__DEV__) {
      // Development: Pretty print
      logFn(`[${entry.level}] ${entry.message}`, entry.context, entry.error);
    } else {
      // Production: JSON format
      logFn(JSON.stringify(entry));
    }
  }

  /**
   * Log to remote service (production)
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.enableRemote) return;

    // Implementation would send to remote logging service
    // e.g., Sentry, LogRocket, CloudWatch, etc.
    try {
      // await fetch('https://logging-service.com/logs', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      // Silent fail for logging errors
      console.error('Failed to send log to remote service', error);
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ): void {
    const entry = this.createLogEntry(level, message, context, error);

    this.logToConsole(entry);
    this.logToRemote(entry);
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Enable/disable console logging
   */
  setConsoleEnabled(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  /**
   * Enable/disable remote logging
   */
  setRemoteEnabled(enabled: boolean): void {
    this.enableRemote = enabled;
  }
}

// Export singleton instance
export const logger = new LoggingService();

// Global error handler
export const setupGlobalErrorHandler = (): void => {
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error('Unhandled error', error, {isFatal});

    // Call original handler
    originalHandler(error, isFatal);
  });
};
