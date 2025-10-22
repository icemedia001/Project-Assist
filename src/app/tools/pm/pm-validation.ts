import { createTool } from "@iqai/adk";
import { z } from "zod";

export const validatePrdTool = createTool({
  name: "validate_prd",
  description: "Validate a Product Requirements Document against comprehensive PM standards",
  schema: z.object({
    prdData: z.object({
      problemStatement: z.string().describe("Problem statement from PRD"),
      targetUsers: z.string().optional().describe("Target user personas"),
      businessGoals: z.array(z.string()).optional().describe("Business objectives"),
      features: z.array(z.object({
        title: z.string(),
        description: z.string(),
        priority: z.string().optional(),
        acceptanceCriteria: z.array(z.string()).optional()
      })).describe("Features defined in PRD"),
      successMetrics: z.array(z.string()).optional().describe("Success metrics"),
      mvpScope: z.array(z.string()).optional().describe("MVP scope definition")
    }).describe("PRD data to validate"),
    validationLevel: z.enum(["comprehensive", "quick", "focused"]).default("comprehensive").describe("Validation depth")
  }),
  fn: ({ prdData, validationLevel }, context) => {
    const validation = performPrdValidation(prdData, validationLevel);
    
    return {
      validation: validation,
      overallScore: validation.overallScore,
      readiness: validation.readiness,
      criticalIssues: validation.criticalIssues,
      recommendations: validation.recommendations,
      message: `PRD validation complete. Overall score: ${validation.overallScore}% - ${validation.readiness}`
    };
  }
});

function performPrdValidation(prdData: any, validationLevel: string): any {
  const checks = {
    problemDefinition: validateProblemDefinition(prdData),
    userResearch: validateUserResearch(prdData),
    businessGoals: validateBusinessGoals(prdData),
    mvpScope: validateMvpScope(prdData),
    features: validateFeatures(prdData),
    successMetrics: validateSuccessMetrics(prdData),
    technicalGuidance: validateTechnicalGuidance(prdData),
    clarity: validateClarity(prdData)
  };
  
  const scores = Object.values(checks).map((check: any) => check.score);
  const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  
  const criticalIssues = Object.values(checks)
    .flatMap((check: any) => check.issues.filter((issue: any) => issue.severity === 'critical'));
  
  const readiness = determineReadiness(overallScore, criticalIssues.length);
  
  return {
    overallScore,
    readiness,
    criticalIssues,
    checks,
    recommendations: generateRecommendations(checks, overallScore)
  };
}

function validateProblemDefinition(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.problemStatement || prdData.problemStatement.length < 20) {
    issues.push({
      category: "Problem Statement",
      issue: "Problem statement is missing or too brief",
      severity: "critical",
      recommendation: "Provide a clear, detailed problem statement"
    });
    score -= 40;
  }
  
  if (!prdData.targetUsers) {
    issues.push({
      category: "Target Users",
      issue: "Target user personas not defined",
      severity: "high",
      recommendation: "Define specific target user personas"
    });
    score -= 20;
  }
  
  return { score: Math.max(0, score), issues };
}

function validateUserResearch(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.targetUsers) {
    issues.push({
      category: "User Research",
      issue: "No user research or persona definition",
      severity: "high",
      recommendation: "Conduct user research and define personas"
    });
    score -= 30;
  }
  
  return { score: Math.max(0, score), issues };
}

function validateBusinessGoals(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.businessGoals || prdData.businessGoals.length === 0) {
    issues.push({
      category: "Business Goals",
      issue: "Business goals not defined",
      severity: "critical",
      recommendation: "Define clear business objectives and success metrics"
    });
    score -= 40;
  }
  
  return { score: Math.max(0, score), issues };
}

function validateMvpScope(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.mvpScope || prdData.mvpScope.length === 0) {
    issues.push({
      category: "MVP Scope",
      issue: "MVP scope not clearly defined",
      severity: "high",
      recommendation: "Define minimum viable product scope"
    });
    score -= 25;
  }
  
  if (prdData.features && prdData.features.length > 10) {
    issues.push({
      category: "MVP Scope",
      issue: "Too many features for MVP",
      severity: "medium",
      recommendation: "Reduce scope to essential features only"
    });
    score -= 15;
  }
  
  return { score: Math.max(0, score), issues };
}

function validateFeatures(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.features || prdData.features.length === 0) {
    issues.push({
      category: "Features",
      issue: "No features defined",
      severity: "critical",
      recommendation: "Define core features for the product"
    });
    score -= 50;
  } else {
    prdData.features.forEach((feature: any, index: number) => {
      if (!feature.acceptanceCriteria || feature.acceptanceCriteria.length === 0) {
        issues.push({
          category: "Features",
          issue: `Feature "${feature.title}" lacks acceptance criteria`,
          severity: "high",
          recommendation: "Add testable acceptance criteria"
        });
        score -= 10;
      }
      
      if (!feature.description || feature.description.length < 10) {
        issues.push({
          category: "Features",
          issue: `Feature "${feature.title}" description is too brief`,
          severity: "medium",
          recommendation: "Provide detailed feature description"
        });
        score -= 5;
      }
    });
  }
  
  return { score: Math.max(0, score), issues };
}

function validateSuccessMetrics(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.successMetrics || prdData.successMetrics.length === 0) {
    issues.push({
      category: "Success Metrics",
      issue: "No success metrics defined",
      severity: "high",
      recommendation: "Define measurable success metrics"
    });
    score -= 30;
  }
  
  return { score: Math.max(0, score), issues };
}

function validateTechnicalGuidance(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (!prdData.technicalConstraints || prdData.technicalConstraints.length === 0) {
    issues.push({
      category: "Technical Guidance",
      issue: "No technical constraints defined",
      severity: "high",
      recommendation: "Define platform, browser, and integration constraints"
    });
    score -= 25;
  }
  
  if (!prdData.architectureGuidance) {
    issues.push({
      category: "Technical Guidance", 
      issue: "No architecture guidance provided",
      severity: "high",
      recommendation: "Include high-level architecture direction and technical decisions"
    });
    score -= 20;
  }
  
  if (!prdData.performanceRequirements) {
    issues.push({
      category: "Technical Guidance",
      issue: "Performance requirements not specified",
      severity: "medium", 
      recommendation: "Define response time, throughput, and scalability requirements"
    });
    score -= 15;
  }
  
  if (!prdData.securityRequirements) {
    issues.push({
      category: "Technical Guidance",
      issue: "Security requirements not defined",
      severity: "high",
      recommendation: "Specify authentication, authorization, and data protection requirements"
    });
    score -= 20;
  }
  
  if (!prdData.integrationRequirements) {
    issues.push({
      category: "Technical Guidance",
      issue: "Integration requirements not specified",
      severity: "medium",
      recommendation: "Define external system integrations and API requirements"
    });
    score -= 10;
  }
  
  if (!prdData.deploymentRequirements) {
    issues.push({
      category: "Technical Guidance",
      issue: "Deployment requirements not addressed",
      severity: "medium",
      recommendation: "Specify deployment environment, infrastructure, and operational requirements"
    });
    score -= 10;
  }
  
  return { score: Math.max(0, score), issues };
}

function validateClarity(prdData: any): any {
  const issues: any[] = [];
  let score = 100;
  
  if (prdData.problemStatement && prdData.problemStatement.length > 200) {
    issues.push({
      category: "Clarity",
      issue: "Problem statement may be too verbose",
      severity: "low",
      recommendation: "Consider simplifying the problem statement"
    });
    score -= 5;
  }
  
  return { score: Math.max(0, score), issues };
}

function determineReadiness(overallScore: number, criticalIssuesCount: number): string {
  if (criticalIssuesCount > 0) {
    return "Not Ready - Critical issues must be resolved";
  }
  
  if (overallScore >= 90) {
    return "Ready for Architecture";
  } else if (overallScore >= 70) {
    return "Nearly Ready - Minor improvements needed";
  } else if (overallScore >= 50) {
    return "Needs Significant Work";
  } else {
    return "Not Ready - Major gaps identified";
  }
}

function generateRecommendations(checks: any, overallScore: number): string[] {
  const recommendations = [];
  
  if (overallScore < 70) {
    recommendations.push("Focus on addressing critical and high-priority issues first");
  }
  
  if (checks.problemDefinition.score < 80) {
    recommendations.push("Strengthen problem definition and user research");
  }
  
  if (checks.features.score < 80) {
    recommendations.push("Improve feature definitions and acceptance criteria");
  }
  
  if (checks.mvpScope.score < 80) {
    recommendations.push("Refine MVP scope to be more focused and achievable");
  }
  
  recommendations.push("Review and validate all requirements with stakeholders");
  recommendations.push("Ensure technical feasibility is assessed for all features");
  
  return recommendations;
}
