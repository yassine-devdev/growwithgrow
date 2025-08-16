import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../monitoring/logger.js';
import zlib from 'zlib';
import { promisify } from 'util';

const logger = createLogger(undefined, undefined, 'compression');

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);
const brotliCompress = promisify(zlib.brotliCompress);

export interface CompressionOptions {
  threshold?: number; // Minimum response size to compress (bytes)
  level?: number; // Compression level (1-9)
  filter?: (req: Request, res: Response) => boolean;
  brotli?: boolean; // Enable Brotli compression
}

// Smart compression middleware
export function smartCompressionMiddleware(options: CompressionOptions = {}) {
  const {
    threshold = 1024, // 1KB
    level = 6,
    filter = defaultFilter,
    brotli = true
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if compression should not be applied
    if (!filter(req, res)) {
      return next();
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    let compressionMethod: 'br' | 'gzip' | 'deflate' | null = null;

    // Determine best compression method
    if (brotli && acceptEncoding.includes('br')) {
      compressionMethod = 'br';
    } else if (acceptEncoding.includes('gzip')) {
      compressionMethod = 'gzip';
    } else if (acceptEncoding.includes('deflate')) {
      compressionMethod = 'deflate';
    }

    if (!compressionMethod) {
      return next();
    }

    // Override response methods
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(body: any) {
      return compressAndSend.call(this, body, compressionMethod!, threshold, level, originalSend);
    };

    res.json = function(obj: any) {
      const body = JSON.stringify(obj);
      return compressAndSend.call(this, body, compressionMethod!, threshold, level, originalSend);
    };

    next();
  };
}

// Compress and send response
async function compressAndSend(
  this: Response,
  body: any,
  method: 'br' | 'gzip' | 'deflate',
  threshold: number,
  level: number,
  originalSend: Function
) {
  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  
  // Skip compression for small responses
  if (bodyBuffer.length < threshold) {
    return originalSend.call(this, body);
  }

  try {
    const startTime = Date.now();
    let compressed: Buffer;

    switch (method) {
      case 'br':
        compressed = await brotliCompress(bodyBuffer, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: level,
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: bodyBuffer.length
          }
        });
        this.setHeader('Content-Encoding', 'br');
        break;
      case 'gzip':
        compressed = await gzip(bodyBuffer, { level });
        this.setHeader('Content-Encoding', 'gzip');
        break;
      case 'deflate':
        compressed = await deflate(bodyBuffer, { level });
        this.setHeader('Content-Encoding', 'deflate');
        break;
      default:
        return originalSend.call(this, body);
    }

    const compressionTime = Date.now() - startTime;
    const compressionRatio = compressed.length / bodyBuffer.length;

    // Set headers
    this.setHeader('Content-Length', compressed.length);
    this.setHeader('Vary', 'Accept-Encoding');
    this.setHeader('X-Compression-Method', method);
    this.setHeader('X-Compression-Ratio', compressionRatio.toFixed(3));
    this.setHeader('X-Compression-Time', `${compressionTime}ms`);

    logger.debug('Response compressed', {
      method,
      originalSize: bodyBuffer.length,
      compressedSize: compressed.length,
      ratio: compressionRatio,
      compressionTime
    });

    return originalSend.call(this, compressed);
  } catch (error) {
    logger.error('Compression failed', error);
    return originalSend.call(this, body);
  }
}

// Default filter function
function defaultFilter(req: Request, res: Response): boolean {
  const contentType = res.getHeader('content-type') as string;
  
  if (!contentType) {
    return false;
  }

  // Compress text-based content types
  const compressibleTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml',
    'image/svg+xml'
  ];

  return compressibleTypes.some(type => contentType.includes(type));
}

// Request batching utilities
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
      params: any;
    }>;
    timer: NodeJS.Timeout;
  }>();

  constructor(
    private batchSize: number = 10,
    private batchTimeout: number = 50 // milliseconds
  ) {}

  // Batch requests by key
  async batch<T>(
    key: string,
    params: any,
    executor: (batchedParams: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let batch = this.batches.get(key);

      if (!batch) {
        batch = {
          requests: [],
          timer: setTimeout(() => this.executeBatch(key, executor), this.batchTimeout)
        };
        this.batches.set(key, batch);
      }

      batch.requests.push({ resolve, reject, params });

      // Execute immediately if batch is full
      if (batch.requests.length >= this.batchSize) {
        clearTimeout(batch.timer);
        this.executeBatch(key, executor);
      }
    });
  }

  private async executeBatch<T>(
    key: string,
    executor: (batchedParams: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(key);
    if (!batch) return;

    this.batches.delete(key);

    try {
      const batchedParams = batch.requests.map(req => req.params);
      const results = await executor(batchedParams);

      // Resolve individual requests
      batch.requests.forEach((request, index) => {
        if (results[index] !== undefined) {
          request.resolve(results[index]);
        } else {
          request.reject(new Error('No result for batched request'));
        }
      });

      logger.debug('Batch executed successfully', {
        key,
        batchSize: batch.requests.length,
        resultsCount: results.length
      });

    } catch (error) {
      // Reject all requests in the batch
      batch.requests.forEach(request => request.reject(error));
      
      logger.error('Batch execution failed', error, {
        key,
        batchSize: batch.requests.length
      });
    }
  }
}

// AI service request batching
export class AIServiceBatcher extends RequestBatcher {
  constructor() {
    super(5, 100); // Batch up to 5 requests, wait max 100ms
  }

  // Batch AI text generation requests
  async batchTextGeneration(
    provider: string,
    model: string,
    prompt: string,
    options: any = {}
  ): Promise<string> {
    const key = `ai:${provider}:${model}:text`;
    
    return this.batch(key, { prompt, options }, async (batchedParams) => {
      // This would call the actual AI service with batched requests
      logger.info('Batching AI text generation requests', {
        provider,
        model,
        batchSize: batchedParams.length
      });

      // Simulate batched AI API call
      const results = await Promise.all(
        batchedParams.map(async ({ prompt, options }) => {
          // Replace with actual AI service call
          return `Generated response for: ${prompt.substring(0, 50)}...`;
        })
      );

      return results;
    });
  }

  // Batch AI embedding requests
  async batchEmbeddings(
    provider: string,
    model: string,
    texts: string[]
  ): Promise<number[][]> {
    const key = `ai:${provider}:${model}:embeddings`;
    
    return this.batch(key, { texts }, async (batchedParams) => {
      const allTexts = batchedParams.flatMap(params => params.texts);
      
      logger.info('Batching AI embedding requests', {
        provider,
        model,
        totalTexts: allTexts.length,
        batchSize: batchedParams.length
      });

      // Simulate batched embedding API call
      const embeddings = allTexts.map(() => 
        Array.from({ length: 1536 }, () => Math.random())
      );

      // Split results back to original requests
      let currentIndex = 0;
      return batchedParams.map(params => {
        const result = embeddings.slice(currentIndex, currentIndex + params.texts.length);
        currentIndex += params.texts.length;
        return result;
      });
    });
  }
}

// Response streaming utilities
export class ResponseStreamer {
  // Stream large JSON responses
  static streamJSON(res: Response, data: any[], options?: {
    batchSize?: number;
    delay?: number;
  }): void {
    const { batchSize = 100, delay = 10 } = options || {};
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    res.write('[');
    
    let sent = 0;
    const sendBatch = () => {
      const batch = data.slice(sent, sent + batchSize);
      
      batch.forEach((item, index) => {
        if (sent > 0 || index > 0) {
          res.write(',');
        }
        res.write(JSON.stringify(item));
      });
      
      sent += batch.length;
      
      if (sent < data.length) {
        setTimeout(sendBatch, delay);
      } else {
        res.write(']');
        res.end();
      }
    };
    
    sendBatch();
  }

  // Stream CSV data
  static streamCSV(res: Response, data: any[], headers: string[], options?: {
    batchSize?: number;
    delay?: number;
  }): void {
    const { batchSize = 1000, delay = 10 } = options || {};
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Send headers
    res.write(headers.join(',') + '\n');
    
    let sent = 0;
    const sendBatch = () => {
      const batch = data.slice(sent, sent + batchSize);
      
      batch.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',');
        
        res.write(row + '\n');
      });
      
      sent += batch.length;
      
      if (sent < data.length) {
        setTimeout(sendBatch, delay);
      } else {
        res.end();
      }
    };
    
    sendBatch();
  }
}

// Singleton instances
export const aiServiceBatcher = new AIServiceBatcher();
export const requestBatcher = new RequestBatcher();