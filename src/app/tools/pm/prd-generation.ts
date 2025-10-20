import { createTool } from "@iqai/adk";
import { z } from "zod";

export const generatePrdTool = createTool({
  name: "generate_prd",
  description: "Generate a comprehensive Product Requirements Document (PRD) from brainstorming session data",
  schema: z.object({
    sessionData: z.object({
      problemStatement: z.string().describe("The core problem being solved"),
      ideas: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        rationale: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.any().optional()
      })).describe("Ideas generated from brainstorming"),
      clusters: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        priority: z.string().optional()
      })).optional().describe("Idea clusters/themes"),
      context: z.string().optional().describe("Additional session context")
    }).describe("Session data to convert to PRD"),
    projectType: z.enum(["greenfield", "brownfield"]).default("greenfield").describe("Type of project"),
    targetUsers: z.string().optional().describe("Target user personas"),
    businessGoals: z.array(z.string()).optional().describe("Business objectives"),
    technicalConstraints: z.array(z.string()).optional().describe("Technical constraints and limitations"),
    architectureGuidance: z.string().optional().describe("High-level architecture direction"),
    performanceRequirements: z.object({
      responseTime: z.string().optional(),
      throughput: z.string().optional(),
      scalability: z.string().optional()
    }).optional().describe("Performance requirements"),
    securityRequirements: z.array(z.string()).optional().describe("Security and compliance requirements"),
    integrationRequirements: z.array(z.string()).optional().describe("External system integration requirements"),
    deploymentRequirements: z.object({
      environment: z.string().optional(),
      infrastructure: z.string().optional(),
      operational: z.array(z.string()).optional()
    }).optional().describe("Deployment and operational requirements")
  }),
  fn: ({ sessionData, projectType, targetUsers, businessGoals, technicalConstraints, architectureGuidance, performanceRequirements, securityRequirements, integrationRequirements, deploymentRequirements }, context) => {
    try {
      if (!sessionData || !sessionData.problemStatement) {
        throw new Error("Session data and problem statement are required");
      }
      
      if (!sessionData.ideas || sessionData.ideas.length === 0) {
        throw new Error("At least one idea is required to generate a PRD");
      }
      
      const prd = generatePrdContent(sessionData, projectType, targetUsers, businessGoals, technicalConstraints, architectureGuidance, performanceRequirements, securityRequirements, integrationRequirements, deploymentRequirements);
      
      return {
        success: true,
        prd: prd,
        sections: {
          problemStatement: sessionData.problemStatement,
          targetUsers: targetUsers || "Primary users of the product",
          businessGoals: businessGoals || ["Increase user engagement", "Improve user experience"],
          features: extractFeaturesFromIdeas(sessionData.ideas),
          successMetrics: generateSuccessMetrics(sessionData),
          mvpScope: defineMvpScope(sessionData.ideas),
          technicalConstraints: technicalConstraints || [],
          architectureGuidance: architectureGuidance || "",
          performanceRequirements: performanceRequirements || {},
          securityRequirements: securityRequirements || [],
          integrationRequirements: integrationRequirements || [],
          deploymentRequirements: deploymentRequirements || {}
        },
        message: `Successfully generated PRD with ${sessionData.ideas.length} features and comprehensive requirements`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to generate PRD"
      };
    }
  }
});

function generatePrdContent(sessionData: any, projectType: string, targetUsers?: string, businessGoals?: string[], technicalConstraints?: string[], architectureGuidance?: string, performanceRequirements?: any, securityRequirements?: string[], integrationRequirements?: string[], deploymentRequirements?: any): string {
  const timestamp = new Date().toISOString();
  const prdTitle = `Product Requirements Document: ${sessionData.problemStatement}`;
  
  let prd = `# ${prdTitle}\n\n`;
  prd += `**Generated:** ${timestamp}\n`;
  prd += `**Project Type:** ${projectType}\n\n`;
  prd += `---\n\n`;
  
  prd += `## Executive Summary\n\n`;
  prd += `This PRD defines the requirements for solving: "${sessionData.problemStatement}"\n\n`;
  prd += `**Target Users:** ${targetUsers || "Primary users of the product"}\n\n`;
  prd += `**Business Goals:**\n`;
  (businessGoals || ["Increase user engagement", "Improve user experience"]).forEach(goal => {
    prd += `- ${goal}\n`;
  });
  prd += `\n`;
  
  prd += `## Problem Statement\n\n`;
  prd += `${sessionData.problemStatement}\n\n`;
  prd += `**Why this problem matters:**\n`;
  prd += `- Directly impacts user experience and satisfaction\n`;
  prd += `- Addresses core user pain points identified in research\n`;
  prd += `- Aligns with business objectives and growth strategy\n\n`;
  
  prd += `## Target Users\n\n`;
  prd += `### Primary Personas\n\n`;
  prd += `**${targetUsers || "Primary Users"}**\n`;
  prd += `- **Needs:** Efficient, intuitive solutions to core problems\n`;
  prd += `- **Pain Points:** Current solutions are inadequate or non-existent\n`;
  prd += `- **Goals:** Achieve desired outcomes with minimal friction\n\n`;
  
  prd += `## Success Metrics\n\n`;
  const metrics = generateSuccessMetrics(sessionData);
  metrics.forEach(metric => {
    prd += `- ${metric}\n`;
  });
  prd += `\n`;
  
  prd += `## MVP Scope\n\n`;
  prd += `### Core Features (Must Have)\n\n`;
  const mvpFeatures = defineMvpScope(sessionData.ideas);
  mvpFeatures.forEach(feature => {
    prd += `- **${feature.title}**: ${feature.description}\n`;
  });
  prd += `\n`;
  
  prd += `## Feature Requirements\n\n`;
  const features = extractFeaturesFromIdeas(sessionData.ideas);
  features.forEach((feature, index) => {
    prd += `### ${index + 1}. ${feature.title}\n\n`;
    prd += `**Description:** ${feature.description}\n\n`;
    prd += `**User Story:**\n`;
    prd += `As a ${targetUsers || "user"}, I want ${feature.title.toLowerCase()} so that I can ${feature.benefit}.\n\n`;
    prd += `**Acceptance Criteria:**\n`;
    prd += `- [ ] ${feature.title} functions as described\n`;
    prd += `- [ ] User can successfully complete the primary workflow\n`;
    prd += `- [ ] Feature meets performance requirements\n`;
    prd += `- [ ] Feature is accessible and usable\n\n`;
    
    if (feature.priority) {
      prd += `**Priority:** ${feature.priority}\n\n`;
    }
    prd += `---\n\n`;
  });
  
  prd += `## Non-Functional Requirements\n\n`;
  prd += `### Performance\n`;
  prd += `- Response time: < 2 seconds for primary actions\n`;
  prd += `- System availability: 99.9% uptime\n`;
  prd += `- Concurrent users: Support 1000+ simultaneous users\n\n`;
  
  prd += `### Security\n`;
  prd += `- User data encryption in transit and at rest\n`;
  prd += `- Authentication and authorization required\n`;
  prd += `- GDPR compliance for data handling\n\n`;
  
  prd += `### Usability\n`;
  prd += `- Intuitive user interface with minimal learning curve\n`;
  prd += `- Mobile-responsive design\n`;
  prd += `- Accessibility compliance (WCAG 2.1 AA)\n\n`;
  
  prd += `## Technical Constraints\n\n`;
  if (technicalConstraints && technicalConstraints.length > 0) {
    technicalConstraints.forEach(constraint => {
      prd += `- ${constraint}\n`;
    });
  } else {
    prd += `- Platform: Web-based application\n`;
    prd += `- Browser support: Modern browsers (Chrome, Firefox, Safari, Edge)\n`;
    prd += `- Mobile support: Responsive design for mobile devices\n`;
    prd += `- Integration: RESTful API architecture\n`;
  }
  prd += `\n`;
  
  if (architectureGuidance) {
    prd += `## Architecture Guidance\n\n`;
    prd += `${architectureGuidance}\n\n`;
  }
  
  if (performanceRequirements) {
    prd += `## Performance Requirements\n\n`;
    if (performanceRequirements.responseTime) {
      prd += `- **Response Time:** ${performanceRequirements.responseTime}\n`;
    }
    if (performanceRequirements.throughput) {
      prd += `- **Throughput:** ${performanceRequirements.throughput}\n`;
    }
    if (performanceRequirements.scalability) {
      prd += `- **Scalability:** ${performanceRequirements.scalability}\n`;
    }
    prd += `\n`;
  }
  
  if (securityRequirements && securityRequirements.length > 0) {
    prd += `## Security Requirements\n\n`;
    securityRequirements.forEach(requirement => {
      prd += `- ${requirement}\n`;
    });
    prd += `\n`;
  }
  
  if (integrationRequirements && integrationRequirements.length > 0) {
    prd += `## Integration Requirements\n\n`;
    integrationRequirements.forEach(requirement => {
      prd += `- ${requirement}\n`;
    });
    prd += `\n`;
  }
  
  if (deploymentRequirements) {
    prd += `## Deployment Requirements\n\n`;
    if (deploymentRequirements.environment) {
      prd += `- **Environment:** ${deploymentRequirements.environment}\n`;
    }
    if (deploymentRequirements.infrastructure) {
      prd += `- **Infrastructure:** ${deploymentRequirements.infrastructure}\n`;
    }
    if (deploymentRequirements.operational && deploymentRequirements.operational.length > 0) {
      prd += `- **Operational Requirements:**\n`;
      deploymentRequirements.operational.forEach((req: string) => {
        prd += `  - ${req}\n`;
      });
    }
    prd += `\n`;
  }
  
  prd += `## Future Enhancements\n\n`;
  prd += `Ideas identified for future development:\n\n`;
  const futureFeatures = sessionData.ideas.filter((idea: any) => 
    idea.metadata?.priority === 'low' || idea.metadata?.feasibility === 'low'
  );
  futureFeatures.forEach((idea: any) => {
    prd += `- **${idea.title}**: ${idea.description}\n`;
  });
  prd += `\n`;
  
  prd += `## Risk Assessment\n\n`;
  prd += `### Technical Risks\n`;
  prd += `- Integration complexity with existing systems\n`;
  prd += `- Performance requirements under high load\n`;
  prd += `- Data migration and compatibility issues\n\n`;
  
  prd += `### Business Risks\n`;
  prd += `- User adoption and engagement\n`;
  prd += `- Competitive landscape changes\n`;
  prd += `- Resource and timeline constraints\n\n`;
  
  prd += `---\n\n`;
  prd += `*PRD generated by Project Assist*\n`;
  
  return prd;
}

function extractFeaturesFromIdeas(ideas: any[]): any[] {
  return ideas.map((idea: any) => ({
    title: idea.title,
    description: idea.description,
    benefit: idea.rationale || "achieve desired outcomes",
    priority: idea.metadata?.priority || "medium",
    category: idea.category || "core"
  }));
}

function generateSuccessMetrics(sessionData: any): string[] {
  return [
    "User engagement: 20% increase in daily active users",
    "Task completion: 90% of users complete primary workflows",
    "User satisfaction: 4.5+ star rating in user feedback",
    "Performance: 95% of actions complete within 2 seconds",
    "Adoption: 80% of target users actively using the product within 30 days"
  ];
}

function defineMvpScope(ideas: any[]): any[] {
  const mvpIdeas = ideas.filter(idea => 
    idea.metadata?.feasibility === 'high' || 
    idea.metadata?.priority === 'high' ||
    !idea.metadata?.feasibility
  ).slice(0, 5);
  
  return mvpIdeas.map(idea => ({
    title: idea.title,
    description: idea.description
  }));
}
