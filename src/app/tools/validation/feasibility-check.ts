import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const feasibilityCheckTool = createTool({
  name: "check_feasibility",
  description: "Check technical and business feasibility of the proposed solution",
  schema: z.object({
    solution: z.string().describe("Description of the proposed solution"),
    requirements: z.array(z.string()).describe("Key requirements to validate"),
    constraints: z.array(z.string()).optional().describe("Known constraints"),
    timeline: z.string().optional().describe("Proposed timeline"),
    resources: z.array(z.string()).optional().describe("Available resources")
  }),
  fn: ({ solution, requirements, constraints = [], timeline, resources = [] }, toolContext) => {
    const feasibilityAreas = {
      technical: {
        criteria: ["Technology maturity", "Team expertise", "Integration complexity", "Performance requirements"],
        score: 0,
        maxScore: 4
      },
      business: {
        criteria: ["Market demand", "Competitive advantage", "Revenue potential", "User adoption"],
        score: 0,
        maxScore: 4
      },
      operational: {
        criteria: ["Resource availability", "Timeline feasibility", "Risk management", "Quality assurance"],
        score: 0,
        maxScore: 4
      },
      financial: {
        criteria: ["Budget adequacy", "ROI potential", "Cost structure", "Revenue model"],
        score: 0,
        maxScore: 4
      }
    };

    let totalScore = 0;
    const maxTotalScore = 16;
    const issues = [];
    const recommendations = [];

    if (solution.toLowerCase().includes("ai") || solution.toLowerCase().includes("machine learning")) {
      if (!resources.some(r => r.toLowerCase().includes("data scientist") || r.toLowerCase().includes("ml engineer"))) {
        issues.push({
          area: "technical",
          issue: "AI/ML solution requires specialized expertise",
          severity: "high"
        });
        recommendations.push("Hire or train ML specialists");
      }
    }

    if (requirements.some(r => r.toLowerCase().includes("real-time"))) {
      feasibilityAreas.technical.score += 1;
      if (!solution.toLowerCase().includes("websocket") && !solution.toLowerCase().includes("streaming")) {
        issues.push({
          area: "technical",
          issue: "Real-time requirements may need specialized infrastructure",
          severity: "medium"
        });
      }
    } else {
      feasibilityAreas.technical.score += 2;
    }

    if (requirements.some(r => r.toLowerCase().includes("market"))) {
      feasibilityAreas.business.score += 2;
    } else {
      issues.push({
        area: "business",
        issue: "Market validation not clearly defined",
        severity: "medium"
      });
    }
    
    if (timeline && timeline.toLowerCase().includes("aggressive")) {
      feasibilityAreas.operational.score += 1;
      issues.push({
        area: "operational",
        issue: "Aggressive timeline may impact quality",
        severity: "high"
      });
      recommendations.push("Consider phased delivery approach");
    } else {
      feasibilityAreas.operational.score += 2;
    }

    if (resources.length >= 3) {
      feasibilityAreas.operational.score += 2;
    } else {
      issues.push({
        area: "operational",
        issue: "Limited team size may impact delivery",
        severity: "medium"
      });
    }

    if (constraints.some(c => c.toLowerCase().includes("budget"))) {
      feasibilityAreas.financial.score += 1;
      recommendations.push("Optimize solution for cost-effectiveness");
    } else {
      feasibilityAreas.financial.score += 2;
    }

    totalScore = Object.values(feasibilityAreas).reduce((sum, area) => sum + area.score, 0);
    const feasibilityPercentage = (totalScore / maxTotalScore) * 100;

    let feasibilityLevel = "low";
    if (feasibilityPercentage >= 75) feasibilityLevel = "high";
    else if (feasibilityPercentage >= 50) feasibilityLevel = "medium";

    const criticalIssues = issues.filter(issue => issue.severity === "high");
    const mediumIssues = issues.filter(issue => issue.severity === "medium");

    return {
      feasibilityLevel,
      feasibilityPercentage: Math.round(feasibilityPercentage),
      totalScore,
      maxTotalScore,
      areas: feasibilityAreas,
      issues,
      criticalIssues: criticalIssues.length,
      mediumIssues: mediumIssues.length,
      recommendations,
      verdict: feasibilityLevel === "high" ? "Proceed with confidence" :
               feasibilityLevel === "medium" ? "Proceed with caution" :
               "Reconsider approach",
      message: `Feasibility check completed: ${feasibilityLevel} feasibility (${Math.round(feasibilityPercentage)}%) with ${issues.length} issues identified`
    };
  },
});
