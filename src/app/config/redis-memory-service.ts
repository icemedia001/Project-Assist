import { createClient, RedisClientType } from 'redis';
import { BaseMemoryService } from '@iqai/adk';
import { env } from './env';

export class RedisMemoryService implements BaseMemoryService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(redisUrl?: string) {
    const url = redisUrl || this.buildRedisUrl();
    this.client = createClient({ url });
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  private buildRedisUrl(): string {
    if (env.REDIS_URL) {
      return env.REDIS_URL;
    }

    const protocol = env.REDIS_PASSWORD ? 'rediss://' : 'redis://';
    const auth = env.REDIS_PASSWORD ? `:${env.REDIS_PASSWORD}@` : '';
    const host = env.REDIS_HOST;
    const port = env.REDIS_PORT;
    const db = env.REDIS_DB;

    return `${protocol}${auth}${host}:${port}/${db}`;
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  private getKey(scope: string, key: string): string {
    return `adk:memory:${scope}:${key}`;
  }

  async get(scope: string, key: string): Promise<string | null> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      return await this.client.get(redisKey);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(scope: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      
      if (ttlSeconds) {
        await this.client.setEx(redisKey, ttlSeconds, value);
      } else {
        await this.client.set(redisKey, value);
      }
      
      if (!key.startsWith('session:')) {
        try {
          await this.indexMemoryData(scope, 'default', key, value);
        } catch (indexError) {
          console.warn('Failed to index data for search:', indexError);
        }
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(scope: string, key: string): Promise<void> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      await this.client.del(redisKey);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async exists(scope: string, key: string): Promise<boolean> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      const result = await this.client.exists(redisKey);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async keys(scope: string, pattern: string = '*'): Promise<string[]> {
    try {
      await this.connect();
      const searchPattern = this.getKey(scope, pattern);
      const keys = await this.client.keys(searchPattern);
      
      const prefix = this.getKey(scope, '');
      return keys.map(key => key.replace(prefix, ''));
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  async clear(scope: string): Promise<void> {
    try {
      await this.connect();
      const pattern = this.getKey(scope, '*');
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async getMultiple(scope: string, keys: string[]): Promise<Record<string, string | null>> {
    try {
      await this.connect();
      const redisKeys = keys.map(key => this.getKey(scope, key));
      const values = await this.client.mGet(redisKeys);
      
      const result: Record<string, string | null> = {};
      keys.forEach((key, index) => {
        result[key] = values[index];
      });
      
      return result;
    } catch (error) {
      console.error('Redis getMultiple error:', error);
      return {};
    }
  }

  async setMultiple(scope: string, data: Record<string, string>, ttlSeconds?: number): Promise<void> {
    try {
      await this.connect();
      const pipeline = this.client.multi();
      
      Object.entries(data).forEach(([key, value]) => {
        const redisKey = this.getKey(scope, key);
        if (ttlSeconds) {
          pipeline.setEx(redisKey, ttlSeconds, value);
        } else {
          pipeline.set(redisKey, value);
        }
      });
      
      await pipeline.exec();
    } catch (error) {
      console.error('Redis setMultiple error:', error);
    }
  }

  async increment(scope: string, key: string, amount: number = 1): Promise<number> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      return await this.client.incrBy(redisKey, amount);
    } catch (error) {
      console.error('Redis increment error:', error);
      return 0;
    }
  }

  async expire(scope: string, key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      await this.client.expire(redisKey, ttlSeconds);
    } catch (error) {
      console.error('Redis expire error:', error);
    }
  }

  async getTtl(scope: string, key: string): Promise<number> {
    try {
      await this.connect();
      const redisKey = this.getKey(scope, key);
      return await this.client.ttl(redisKey);
    } catch (error) {
      console.error('Redis getTtl error:', error);
      return -1;
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping error:', error);
      return false;
    }
  }

  async info(): Promise<string> {
    try {
      await this.connect();
      return await this.client.info();
    } catch (error) {
      console.error('Redis info error:', error);
      return 'Redis info unavailable';
    }
  }

  async searchMemory(params: { appName: string; userId: string; query: string }): Promise<any> {
    try {
      await this.connect();
      
      const searchIndex = `idx:${params.appName}:${params.userId}`;
      const searchQuery = `@content:${params.query}*`;
      
      try {
        const searchResults = await this.client.ft.search(searchIndex, searchQuery, {
          LIMIT: { from: 0, size: 10 }
        });
        
        const results: Array<{ key: string; value: string; score?: number }> = [];
        
        if (searchResults.documents) {
          for (const doc of searchResults.documents) {
            results.push({
              key: doc.id,
              value: String(doc.value.content || ''),
              score: (doc as any).score
            });
          }
        }
        
        return results;
      } catch (searchError) {
        console.warn('RediSearch not available, falling back to pattern matching:', searchError);
        
        const pattern = `adk:memory:${params.appName}:${params.userId}:*${params.query}*`;
        const keys = await this.client.keys(pattern);
        const results: Array<{ key: string; value: string; score?: number }> = [];
        
        for (const key of keys.slice(0, 10)) {
          const value = await this.client.get(key);
          if (value) {
            const cleanKey = key.replace(`adk:memory:${params.appName}:${params.userId}:`, '');
            results.push({ key: cleanKey, value });
          }
        }
        
        return results;
      }
    } catch (error) {
      console.error('Redis searchMemory error:', error);
      return [];
    }
  }

  async addSessionToMemory(session: any): Promise<void> {
    try {
      await this.connect();
      const key = `session:${session.id || session.sessionId}`;
      await this.client.set(key, JSON.stringify(session));
    } catch (error) {
      console.error('Redis addSessionToMemory error:', error);
    }
  }

  async getSessionFromMemory(sessionId: string): Promise<any> {
    try {
      await this.connect();
      const key = `session:${sessionId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getSessionFromMemory error:', error);
      return null;
    }
  }

  async removeSessionFromMemory(sessionId: string): Promise<void> {
    try {
      await this.connect();
      const key = `session:${sessionId}`;
      await this.client.del(key);
    } catch (error) {
      console.error('Redis removeSessionFromMemory error:', error);
    }
  }

  async addToMemory(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      await this.connect();
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis addToMemory error:', error);
    }
  }

  async getFromMemory(key: string): Promise<any> {
    try {
      await this.connect();
      const value = await this.client.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis getFromMemory error:', error);
      return null;
    }
  }

  async removeFromMemory(key: string): Promise<void> {
    try {
      await this.connect();
      await this.client.del(key);
    } catch (error) {
      console.error('Redis removeFromMemory error:', error);
    }
  }

  async createSearchIndex(appName: string, userId: string): Promise<void> {
    try {
      await this.connect();
      const indexName = `idx:${appName}:${userId}`;
      
      try {
        await this.client.ft.info(indexName);
        console.log(`Search index ${indexName} already exists`);
      } catch (error) {
        (this.client.ft as any).create(indexName, {
          '$.content': {
            type: 'TEXT',
            AS: 'content'
          },
          '$.key': {
            type: 'TEXT',
            AS: 'key'
          },
          '$.timestamp': {
            type: 'NUMERIC',
            AS: 'timestamp'
          }
        }, {
          ON: 'JSON',
          PREFIX: `adk:memory:${appName}:${userId}`
        });
        
        console.log(`Created search index: ${indexName}`);
      }
    } catch (error) {
      console.error('Redis createSearchIndex error:', error);
    }
  }

  async indexMemoryData(appName: string, userId: string, key: string, value: string): Promise<void> {
    try {
      await this.connect();
      
      await this.createSearchIndex(appName, userId);
      
      const memoryKey = this.getKey(appName, `${userId}:${key}`);
      const indexedData = {
        content: value,
        key: key,
        timestamp: Date.now()
      };
      
      await this.client.json.set(memoryKey, '$', indexedData);
    } catch (error) {
      console.error('Redis indexMemoryData error:', error);
    }
  }

  async deleteSearchIndex(appName: string, userId: string): Promise<void> {
    try {
      await this.connect();
      const indexName = `idx:${appName}:${userId}`;
      await this.client.ft.dropIndex(indexName);
      console.log(`Deleted search index: ${indexName}`);
    } catch (error) {
      console.error('Redis deleteSearchIndex error:', error);
    }
  }
}
