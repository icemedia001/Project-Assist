import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const techStackTool = createTool({
  name: "recommend_tech_stack",
  description: "Recommend technology stack based on project requirements and constraints",
  schema: z.object({
    projectType: z.enum([
      "web_app", "mobile_app", "desktop_app", "api", "data_pipeline", 
      "ml_model", "blockchain", "iot", "game", "other"
    ]).describe("Type of project being built"),
    requirements: z.array(z.string()).describe("Key technical requirements"),
    constraints: z.array(z.string()).optional().describe("Technical constraints (budget, timeline, team skills)"),
    scale: z.enum(["small", "medium", "large", "enterprise"]).default("medium").describe("Expected scale"),
    teamSize: z.number().optional().describe("Development team size")
  }),
  fn: ({ projectType, requirements, constraints = [], scale, teamSize }, toolContext) => {
    const techStacks = {
      web_app: {
        frontend: ["React", "Vue.js", "Angular", "Svelte"],
        backend: ["Node.js", "Python (Django/FastAPI)", "Ruby on Rails", "Java (Spring)"],
        database: ["PostgreSQL", "MongoDB", "MySQL", "Redis"],
        deployment: ["Vercel", "Netlify", "AWS", "Google Cloud", "Docker"]
      },
      mobile_app: {
        native: ["Swift (iOS)", "Kotlin (Android)"],
        cross_platform: ["React Native", "Flutter", "Xamarin"],
        backend: ["Node.js", "Firebase", "AWS Amplify"],
        database: ["Firebase", "MongoDB", "PostgreSQL"]
      },
      api: {
        frameworks: ["Express.js", "FastAPI", "Django REST", "Spring Boot", "NestJS"],
        database: ["PostgreSQL", "MongoDB", "Redis"],
        deployment: ["AWS Lambda", "Google Cloud Functions", "Docker", "Kubernetes"]
      },
      data_pipeline: {
        processing: ["Apache Spark", "Apache Kafka", "Apache Airflow"],
        storage: ["AWS S3", "Google Cloud Storage", "Apache Hadoop"],
        databases: ["PostgreSQL", "ClickHouse", "BigQuery", "Snowflake"]
      }
    };

    const stack = techStacks[projectType as keyof typeof techStacks] || techStacks.web_app;
    
    let recommendations = {
      projectType,
      scale,
      teamSize,
      recommendedStack: stack,
      reasoning: [] as string[],
      alternatives: [] as string[]
    };

    if (requirements.includes("real-time")) {
      recommendations.reasoning.push("Real-time requirements suggest WebSocket support and event-driven architecture");
    }
    
    if (requirements.includes("scalability")) {
      recommendations.reasoning.push("Scalability requirements suggest microservices architecture and cloud deployment");
    }
    
    if (constraints.includes("budget")) {
      recommendations.reasoning.push("Budget constraints suggest open-source technologies and cost-effective cloud solutions");
    }

    if (teamSize && teamSize < 5) {
      recommendations.reasoning.push("Small team size suggests full-stack frameworks and managed services");
    }

    return {
      ...recommendations,
      message: `Recommended tech stack for ${projectType} project with ${scale} scale`
    };
  },
});
