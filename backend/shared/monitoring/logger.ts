import winston from 'winston';
import { nanoid } from 'nanoid';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, correlationId, userId, component, ...meta } = info;
    
    const logEntry = {
      timestamp,
      level,
      message,
      correlationId: correlationId || 'unknown',
      userId: userId || null,
      component: component || 'unknown',
      ...meta
    };
    
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, correlationId, userId, component, ...meta } = info;
    
    let logMessage = `${timestamp} [${level}]`;
    
    if (correlationId) {
      logMessage += ` [${correlationId}]`;
    }
    
    if (component) {
      logMessage += ` [${component}]`;
    }
    
    if (userId) {
      logMessage += ` [user:${userId}]`;
    }
    
    logMessage += `: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: structuredFormat,
  defaultMeta: {
    service: 'production-app',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
} else {
  // In production, use structured format for console as well
  logger.add(new winston.transports.Console({
    format: structuredFormat
  }));
}

// Correlation ID middleware for Express
export function correlationIdMiddleware(req: any, res: any, next: any) {
  const correlationId = req.headers['x-correlation-id'] || nanoid();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

// Enhanced logger with correlation ID support
export class StructuredLogger {
  private correlationId?: string;
  private userId?: string;
  private component?: string;

  constructor(correlationId?: string, userId?: string, component?: string) {
    this.correlationId = correlationId;
    this.userId = userId;
    this.component = component;
  }

  private log(level: string, message: string, meta: any = {}) {
    logger.log(level, message, {
      correlationId: this.correlationId,
      userId: this.userId,
      component: this.component,
      ...meta
    });
  }

  error(message: string, error?: Error, meta: any = {}) {
    this.log('error', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      ...meta
    });
  }

  warn(message: string, meta: any = {}) {
    this.log('warn', message, meta);
  }

  info(message: string, meta: any = {}) {
    this.log('info', message, meta);
  }

  http(message: string, meta: any = {}) {
    this.log('http', message, meta);
  }

  debug(message: string, meta: any = {}) {
    this.log('debug', message, meta);
  }

  // Business event logging
  businessEvent(event: string, data: any = {}) {
    this.info(`Business Event: ${event}`, {
      eventType: 'business',
      event,
      data
    });
  }

  // Security event logging
  securityEvent(event: string, data: any = {}) {
    this.warn(`Security Event: ${event}`, {
      eventType: 'security',
      event,
      data
    });
  }

  // Performance logging
  performance(operation: string, duration: number, meta: any = {}) {
    this.info(`Performance: ${operation}`, {
      eventType: 'performance',
      operation,
      duration,
      ...meta
    });
  }

  // AI usage logging
  aiUsage(provider: string, model: string, operation: string, tokens: number, cost: number, meta: any = {}) {
    this.info(`AI Usage: ${provider}/${model}/${operation}`, {
      eventType: 'ai_usage',
      provider,
      model,
      operation,
      tokens,
      cost,
      ...meta
    });
  }

  // Database operation logging
  databaseOperation(operation: string, table: string, duration: number, meta: any = {}) {
    this.debug(`Database: ${operation} on ${table}`, {
      eventType: 'database',
      operation,
      table,
      duration,
      ...meta
    });
  }

  // Create child logger with additional context
  child(additionalContext: { correlationId?: string; userId?: string; component?: string }) {
    return new StructuredLogger(
      additionalContext.correlationId || this.correlationId,
      additionalContext.userId || this.userId,
      additionalContext.component || this.component
    );
  }
}

// Factory function to create logger with context
export function createLogger(correlationId?: string, userId?: string, component?: string): StructuredLogger {
  return new StructuredLogger(correlationId, userId, component);
}

// Default logger instance
export const defaultLogger = new StructuredLogger();

// Express middleware to add logger to request
export function loggerMiddleware(req: any, res: any, next: any) {
  req.logger = createLogger(req.correlationId, req.user?.id, 'http');
  
  // Log HTTP request
  req.logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    query: req.query,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });
  
  // Log HTTP response
  const originalSend = res.send;
  res.send = function(data: any) {
    req.logger.http('HTTP Response', {
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
      contentLength: data ? data.length : 0
    });
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Error logging middleware
export function errorLoggingMiddleware(error: Error, req: any, res: any, next: any) {
  const logger = req.logger || defaultLogger;
  
  logger.error('Unhandled Error', error, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    statusCode: res.statusCode
  });
  
  next(error);
}

export default logger;