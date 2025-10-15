import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Database URL is required").url("Invalid database URL format"),
  
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').refine(
    (key) => key.startsWith('sk-') || key.startsWith('sk-proj-'),
    'OpenAI API key must start with "sk-" or "sk-proj-"'
  ),
  GOOGLE_API_KEY: z.string().optional().refine(
    (key) => !key || key.length > 10,
    'Google API key must be at least 10 characters if provided'
  ),
         ANTHROPIC_API_KEY: z.string().optional(),
  
  LLM_MODEL: z.string().default('gpt-4o'),
  AGENT_MAX_ITERATIONS: z.string().default('10').transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      throw new Error('AGENT_MAX_ITERATIONS must be a number between 1 and 100');
    }
    return num;
  }),
  AGENT_TIMEOUT: z.string().default('30000').transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1000 || num > 300000) {
      throw new Error('AGENT_TIMEOUT must be a number between 1000 and 300000 milliseconds');
    }
    return num;
  }),
  
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GitHub Client ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GitHub Client Secret is required'),
  
  REDIS_URL: z.string().optional().refine(
    (url) => !url || url.startsWith('redis://') || url.startsWith('rediss://'),
    'Redis URL must start with redis:// or rediss://'
  ),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 65535) {
      throw new Error('REDIS_PORT must be a number between 1 and 65535');
    }
    return num;
  }),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 15) {
      throw new Error('REDIS_DB must be a number between 0 and 15');
    }
    return num;
  }),
  
  GCS_BUCKET_NAME: z.string().optional().refine(
    (bucket) => !bucket || bucket.length >= 3,
    'GCS bucket name must be at least 3 characters if provided'
  ),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  GOOGLE_CLOUD_REGION: z.string().default('us-central1'),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 65535) {
      throw new Error('PORT must be a number between 1 and 65535');
    }
    return num;
  }),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.join('.');
        const message = err.message;
        return `  ${path}: ${message}`;
      });
      
      console.error('Environment validation failed:');
      console.error(missingVars.join('\n'));
      console.error('\nPlease check your .env file and ensure all required variables are set correctly.');
      console.error('See .env.example for reference values.');
      
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

export const env = validateEnv();

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

if (isDevelopment) {
  console.log('🔧 Environment: Development');
  console.log(`LLM Model: ${env.LLM_MODEL}`);
  console.log(`Agent Config: ${env.AGENT_MAX_ITERATIONS} iterations, ${env.AGENT_TIMEOUT}ms timeout`);
}
