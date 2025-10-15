import { NextRequest, NextResponse } from "next/server";
import { createSessionService, createMemoryService, createArtifactService } from "@/app/config/adk";
import { prisma } from "@/app/config/db";

export async function GET(request: NextRequest) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown', error: null as string | null },
      session: { status: 'unknown', error: null as string | null, type: undefined as string | undefined },
      memory: { status: 'unknown', error: null as string | null, type: undefined as string | undefined, structure: undefined as string | undefined },
      artifact: { status: 'unknown', error: null as string | null, type: undefined as string | undefined },
      pg: { status: 'unknown', error: null as string | null }
    }
  };

  try {
    require('pg');
    health.services.pg.status = 'healthy';
  } catch (error) {
    health.services.pg.status = 'unhealthy';
    health.services.pg.error = error instanceof Error ? error.message : String(error);
    health.status = 'unhealthy';
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database.status = 'healthy';
  } catch (error) {
    health.services.database.status = 'unhealthy';
    health.services.database.error = error instanceof Error ? error.message : String(error);
    health.status = 'unhealthy';
  }

  try {
    const sessionService = await createSessionService();
    health.services.session.status = 'healthy';
    health.services.session.type = sessionService.constructor.name;
  } catch (error) {
    health.services.session.status = 'unhealthy';
    health.services.session.error = error instanceof Error ? error.message : String(error);
    health.status = 'unhealthy';
  }

  try {
    const memoryService = await createMemoryService();
    health.services.memory.status = 'healthy';
    health.services.memory.type = memoryService.constructor.name;
    
    const testResult = await memoryService.searchMemory({
      appName: 'health-check',
      userId: 'health-check',
      query: 'test'
    });
    
    if (testResult && typeof testResult === 'object' && Array.isArray(testResult.memories)) {
      health.services.memory.structure = 'correct';
    } else {
      health.services.memory.structure = 'incorrect';
      health.services.memory.error = 'Memory service does not return { memories: [] } structure';
      health.status = 'unhealthy';
    }
  } catch (error) {
    health.services.memory.status = 'unhealthy';
    health.services.memory.error = error instanceof Error ? error.message : String(error);
    health.status = 'unhealthy';
  }

  try {
    const artifactService = await createArtifactService();
    health.services.artifact.status = 'healthy';
    health.services.artifact.type = artifactService.constructor.name;
  } catch (error) {
    health.services.artifact.status = 'unhealthy';
    health.services.artifact.error = error instanceof Error ? error.message : String(error);
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}