import { SecurityConfig, SecurityConfigSchema } from './types';

// Environment-specific security configuration
const getEnvironmentConfig = (): Partial<SecurityConfig> => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        cors: {
          origins: process.env.CORS_ORIGINS?.split(',') || [
            'https://yourdomain.com',
            'https://www.yourdomain.com'
          ],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token'
          ],
          maxAge: 86400
        },
        rateLimit: {
          windowMs: 60 * 1000, // 1 minute
          max: 100, // 100 requests per minute per IP
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          message: 'Too many requests from this IP, please try again later.'
        },
        helmet: {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'", "https://api.openrouter.ai", "https://generativelanguage.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"]
            }
          },
          hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
          },
          noSniff: true,
          xssFilter: true,
          referrerPolicy: 'strict-origin-when-cross-origin',
          frameguard: {
            action: 'deny'
          }
        }
      };
      
    case 'staging':
      return {
        cors: {
          origins: process.env.CORS_ORIGINS?.split(',') || [
            'https://staging.yourdomain.com',
            'http://localhost:3000',
            'http://localhost:5173'
          ],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token'
          ],
          maxAge: 86400
        },
        rateLimit: {
          windowMs: 60 * 1000,
          max: 200, // More lenient for staging
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          message: 'Too many requests from this IP, please try again later.'
        }
      };
      
    case 'development':
    case 'test':
    default:
      return {
        cors: {
          origins: [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://localhost:3000',
            'https://localhost:5173'
          ],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token'
          ],
          maxAge: 86400
        },
        rateLimit: {
          windowMs: 60 * 1000,
          max: 1000, // Very lenient for development
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          message: 'Too many requests from this IP, please try again later.'
        },
        helmet: {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow eval for dev tools
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:", "http:"],
              connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
              fontSrc: ["'self'", "data:", "https:"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'self'"]
            }
          },
          hsts: {
            maxAge: 0, // Disable HSTS in development
            includeSubDomains: false,
            preload: false
          },
          noSniff: true,
          xssFilter: true,
          referrerPolicy: 'strict-origin-when-cross-origin',
          frameguard: {
            action: 'sameorigin' // Allow framing in development
          }
        }
      };
  }
};

// Create and validate security configuration
export const createSecurityConfig = (): SecurityConfig => {
  const envConfig = getEnvironmentConfig();
  
  // Start with default values from schema
  const baseConfig = {
    cors: {
      origins: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://localhost:3000',
        'https://localhost:5173'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token'
      ],
      maxAge: 86400
    },
    rateLimit: {
      windowMs: 60 * 1000,
      max: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: 'strict-origin-when-cross-origin' as const,
      frameguard: {
        action: 'deny' as const
      }
    },
    sanitization: {
      enabled: true,
      allowedTags: [],
      allowedAttributes: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    }
  };
  
  // Deep merge with environment config
  const mergedConfig = {
    cors: { ...baseConfig.cors, ...envConfig.cors },
    rateLimit: { ...baseConfig.rateLimit, ...envConfig.rateLimit },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          ...baseConfig.helmet.contentSecurityPolicy.directives,
          ...envConfig.helmet?.contentSecurityPolicy?.directives
        }
      },
      hsts: { ...baseConfig.helmet.hsts, ...envConfig.helmet?.hsts },
      noSniff: envConfig.helmet?.noSniff ?? baseConfig.helmet.noSniff,
      xssFilter: envConfig.helmet?.xssFilter ?? baseConfig.helmet.xssFilter,
      referrerPolicy: envConfig.helmet?.referrerPolicy ?? baseConfig.helmet.referrerPolicy,
      frameguard: { ...baseConfig.helmet.frameguard, ...envConfig.helmet?.frameguard }
    },
    sanitization: { ...baseConfig.sanitization, ...envConfig.sanitization }
  };
  
  return SecurityConfigSchema.parse(mergedConfig);
};

// Export the configured security settings
export const securityConfig = createSecurityConfig();