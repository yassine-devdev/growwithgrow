import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  helmet(),
  cors(),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
];