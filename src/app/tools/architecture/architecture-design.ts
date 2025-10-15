import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const architectureDesignTool = createTool({
  name: "design_architecture",
  description: "Design system architecture based on requirements and constraints",
  schema: z.object({
    systemType: z.enum([
      "monolith", "microservices", "serverless", "event_driven", 
      "layered", "hexagonal", "clean_architecture"
    ]).describe("Type of system architecture"),
    components: z.array(z.string()).describe("Key system components"),
    integrations: z.array(z.string()).optional().describe("External integrations required"),
    performance: z.enum(["low", "medium", "high", "critical"]).default("medium").describe("Performance requirements"),
    availability: z.enum(["99%", "99.9%", "99.99%", "99.999%"]).default("99.9%").describe("Availability requirements")
  }),
  fn: ({ systemType, components, integrations = [], performance, availability }, toolContext) => {
    const architecturePatterns = {
      monolith: {
        description: "Single deployable unit with all functionality",
        pros: ["Simple deployment", "Easy development", "Consistent data"],
        cons: ["Hard to scale", "Technology lock-in", "Single point of failure"],
        bestFor: ["Small teams", "Simple applications", "Rapid prototyping"]
      },
      microservices: {
        description: "Loosely coupled services with independent deployment",
        pros: ["Independent scaling", "Technology diversity", "Fault isolation"],
        cons: ["Complex deployment", "Network latency", "Data consistency"],
        bestFor: ["Large teams", "Complex domains", "High scalability needs"]
      },
      serverless: {
        description: "Event-driven functions with automatic scaling",
        pros: ["No server management", "Pay per use", "Automatic scaling"],
        cons: ["Cold starts", "Vendor lock-in", "Limited execution time"],
        bestFor: ["Event processing", "APIs", "Batch jobs"]
      },
      event_driven: {
        description: "Asynchronous communication through events",
        pros: ["Loose coupling", "Scalability", "Resilience"],
        cons: ["Complex debugging", "Eventual consistency", "Message ordering"],
        bestFor: ["Real-time systems", "High throughput", "Distributed systems"]
      }
    };

    const pattern = architecturePatterns[systemType as keyof typeof architecturePatterns] || architecturePatterns.monolith;
    
    const architecture = {
      systemType,
      pattern,
      components: components.map(comp => ({
        name: comp,
        responsibilities: `Handles ${comp.toLowerCase()} functionality`,
        interfaces: `Exposes APIs for ${comp.toLowerCase()} operations`
      })),
      integrations: integrations.map(integration => ({
        name: integration,
        type: "external",
        protocol: "REST/GraphQL",
        authentication: "API Key/OAuth"
      })),
      performance: {
        level: performance,
        recommendations: performance === "high" ? 
          ["Caching layer", "CDN", "Database optimization", "Load balancing"] :
          performance === "critical" ?
          ["Distributed caching", "Global CDN", "Database sharding", "Auto-scaling"] :
          ["Basic caching", "Database indexing"]
      },
      availability: {
        target: availability,
        strategies: availability === "99.99%" || availability === "99.999%" ?
          ["Multi-region deployment", "Circuit breakers", "Health checks", "Auto-recovery"] :
          ["Single region", "Basic monitoring", "Backup systems"]
      }
    };

    return {
      ...architecture,
      message: `Designed ${systemType} architecture for ${components.length} components with ${performance} performance requirements`
    };
  },
});
