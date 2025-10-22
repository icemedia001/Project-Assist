import { env, isDevelopment, isProduction } from './env';
import { 
  AgentBuilder, 
  createDatabaseSessionService, 
  InMemoryArtifactService,
  InMemoryMemoryService,
  InMemorySessionService,
  GcsArtifactService,
  type BaseSessionService,
  type BaseMemoryService
} from '@iqai/adk';
import { RedisMemoryService } from './redis-memory-service';

export interface ADKConfig {
  sessionService: {
    type: 'database' | 'memory';
    connectionString?: string;
  };
  
  artifactService: {
    type: 'memory' | 'gcs';
    config?: Record<string, unknown>;
  };
  
  memoryService: {
    type: 'memory' | 'redis';
    config?: Record<string, unknown>;
  };
  
  defaultModel: string;
  agents: {
    maxIterations: number;
    timeout: number;
  };
}

export const adkConfig: ADKConfig = {
  sessionService: {
    type: 'database',
    connectionString: process.env.ADK_DATABASE_URL || env.DATABASE_URL,
  },
  
  artifactService: {
    type: (isProduction || process.env.USE_GCS === 'true') ? 'gcs' : 'memory',
    config: (isProduction || process.env.USE_GCS === 'true') ? {
      bucketName: env.GCS_BUCKET_NAME,
      credentials: env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: env.GOOGLE_CLOUD_PROJECT
    } : undefined
  },
  
  memoryService: {
    type: (isProduction || process.env.USE_REDIS === 'true') ? 'redis' : 'memory',
    config: (isProduction || process.env.USE_REDIS === 'true') ? {
      url: env.REDIS_URL,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB
    } : undefined
  },
  
  defaultModel: env.LLM_MODEL,
  agents: {
    maxIterations: env.AGENT_MAX_ITERATIONS,
    timeout: env.AGENT_TIMEOUT,
  },
};

export async function createSessionService(): Promise<BaseSessionService> {
  try {
    if (adkConfig.sessionService.type === 'database' && adkConfig.sessionService.connectionString) {
      try {
        require('pg');
      } catch (pgError) {
        console.error('PostgreSQL driver not available:', pgError);
        throw new Error('Missing required peer dependency: pg\nTo use PostgreSQL sessions, install the required package:\n\tnpm install pg\n\t# or\n\tpnpm add pg\n\t# or\n\tyarn add pg');
      }
      
      const service = createDatabaseSessionService(adkConfig.sessionService.connectionString);
      if (isDevelopment) {
        console.log('Using database session service');
      }
      return service;
    }
    
    return new InMemorySessionService();
  } catch (error) {
    console.error('Failed to create session service:', error);
    console.log('Falling back to in-memory session service');
    return new InMemorySessionService();
  }
}

export async function createSessionServiceWithUser(
  userId: string, 
  appName: string = 'discovery-workshop'
): Promise<{ sessionService: BaseSessionService; sessionConfig: { userId: string; appName: string } }> {
  const sessionService = await createSessionService();
  return {
    sessionService,
    sessionConfig: { userId, appName }
  };
}

export async function createArtifactService(): Promise<GcsArtifactService | InMemoryArtifactService> {
  try {
    if (adkConfig.artifactService.type === 'gcs' && adkConfig.artifactService.config) {
      const { bucketName, credentials, projectId } = adkConfig.artifactService.config;
      
      if (!bucketName) {
        console.warn('GCS bucket name not provided, falling back to in-memory artifact service');
        return new InMemoryArtifactService();
      }

      const storageOptions: any = {};
      if (credentials) {
        if (typeof credentials === 'string' && credentials.startsWith('{')) {
          storageOptions.credentials = JSON.parse(credentials);
        } else {
          storageOptions.keyFilename = credentials;
        }
      }
      if (projectId) {
        storageOptions.projectId = projectId;
      }

      const gcsService = new GcsArtifactService(bucketName as string, storageOptions);
      
      try {
        await gcsService.listArtifactKeys({
          appName: 'test',
          userId: 'test',
          sessionId: 'test'
        });
        
        if (isDevelopment) {
          console.log('Using GCS artifact service');
        }
        return gcsService;
      } catch (gcsError) {
        console.warn('GCS connection failed, falling back to in-memory artifact service:', gcsError);
        return new InMemoryArtifactService();
      }
    }
    
    if (isDevelopment) {
      console.log('Using in-memory artifact service');
    }
    return new InMemoryArtifactService();
  } catch (error) {
    console.error('Failed to create artifact service:', error);
    console.log('Falling back to in-memory artifact service');
    return new InMemoryArtifactService();
  }
}

export async function createMemoryService(): Promise<BaseMemoryService> {
  try {
    if (adkConfig.memoryService.type === 'redis' && adkConfig.memoryService.config) {
      const redisService = new RedisMemoryService(adkConfig.memoryService.config.url as string);
      
      const isConnected = await redisService.ping();
      if (isConnected) {
        if (isDevelopment) {
          console.log('Using Redis memory service');
        }
        return redisService;
      } else {
        console.warn('Redis connection failed, falling back to in-memory memory service');
      }
    }
    
    if (isDevelopment) {
      console.log('Using in-memory memory service');
    }
    return new InMemoryMemoryService();
  } catch (error) {
    console.error('Failed to create memory service:', error);
    console.log('Falling back to in-memory memory service');
    return new InMemoryMemoryService();
  }
}

export async function createConfiguredAgentBuilder(name: string): Promise<AgentBuilder> {
  try {
    const sessionService = await createSessionService();
    const artifactService = await createArtifactService();
    const memoryService = await createMemoryService();
    
    return AgentBuilder.create(name)
      .withModel(adkConfig.defaultModel)
      .withSessionService(sessionService)
      .withArtifactService(artifactService)
      .withMemory(memoryService);
  } catch (error) {
    console.error('Failed to create configured agent builder:', error);
    throw new Error(`Failed to create agent builder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createDiscoveryAgentBuilder(
  name: string, 
  userId: string
): Promise<AgentBuilder> {
  try {
    const { sessionService, sessionConfig } = await createSessionServiceWithUser(userId);
    const artifactService = await createArtifactService();
    const memoryService = await createMemoryService();
    
    return AgentBuilder.create(name)
      .withModel(adkConfig.defaultModel)
      .withSessionService(sessionService, sessionConfig)
      .withArtifactService(artifactService)
      .withMemory(memoryService);
  } catch (error) {
    console.error('Failed to create discovery agent builder:', error);
    throw new Error(`Failed to create discovery agent builder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}