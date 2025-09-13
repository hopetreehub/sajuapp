import NodeCache from 'node-cache';
import { logger } from '@/utils/logger';

export interface CacheConfig {
  ttlSeconds: number;
  maxKeys: number;
}

export class CacheService {
  private cache: NodeCache;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(config: CacheConfig) {
    this.cache = new NodeCache({
      stdTTL: config.ttlSeconds,
      maxKeys: config.maxKeys,
      checkperiod: 600, // 10 minutes cleanup interval
      useClones: false
    });

    // Event listeners for monitoring
    this.cache.on('set', (key, value) => {
      logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('del', (key, value) => {
      logger.debug(`Cache DEL: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });
  }

  public get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hitCount++;
      logger.debug(`Cache HIT: ${key}`);
      return value;
    } else {
      this.missCount++;
      logger.debug(`Cache MISS: ${key}`);
      return undefined;
    }
  }

  public set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl);
      if (success) {
        logger.debug(`Cache SET successful: ${key}`);
      }
      return success;
    } catch (error) {
      logger.error(`Cache SET failed for key ${key}:`, error);
      return false;
    }
  }

  public del(key: string | string[]): number {
    const deleted = this.cache.del(key);
    logger.debug(`Cache DEL: ${Array.isArray(key) ? key.join(', ') : key} (${deleted} deleted)`);
    return deleted;
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public keys(): string[] {
    return this.cache.keys();
  }

  public flush(): void {
    this.cache.flushAll();
    this.hitCount = 0;
    this.missCount = 0;
    logger.info('Cache flushed');
  }

  public getStats(): {
    keys: number;
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  } {
    const keys = this.cache.keys();
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      keys: keys.length,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.getStats().ksize || 0
    };
  }

  public getTTL(key: string): number {
    return this.cache.getTtl(key);
  }

  public touch(key: string): boolean {
    return this.cache.ttl(key);
  }

  public close(): void {
    this.cache.close();
    logger.info('Cache service closed');
  }
}