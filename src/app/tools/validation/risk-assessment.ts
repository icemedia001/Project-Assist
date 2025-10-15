import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const riskAssessmentTool = createTool({
  name: "assess_risks",
  description: "Assess risks and identify potential issues in the project plan",
  schema: z.object({
    projectScope: z.string().describe("Description of the project scope"),
    timeline: z.string().optional().describe("Project timeline"),
    budget: z.string().optional().describe("Budget constraints"),
    team: z.array(z.string()).optional().describe("Team composition and skills"),
    dependencies: z.array(z.string()).optional().describe("External dependencies")
  }),
  fn: ({ projectScope, timeline, budget, team = [], dependencies = [] }, toolContext) => {
    const riskCategories = {
      technical: [
        "Technology complexity",
        "Integration challenges", 
        "Performance bottlenecks",
        "Security vulnerabilities",
        "Scalability limitations"
      ],
      business: [
        "Market changes",
        "Competitor actions",
        "Regulatory changes",
        "User adoption",
        "Revenue model"
      ],
      operational: [
        "Team capacity",
        "Skill gaps",
        "Resource availability",
        "Timeline pressure",
        "Quality assurance"
      ],
      external: [
        "Third-party dependencies",
        "Vendor reliability",
        "Infrastructure issues",
        "Economic factors",
        "Legal compliance"
      ]
    };

    const risks = [];
    let riskScore = 0;

    if (projectScope.toLowerCase().includes("complex") || projectScope.toLowerCase().includes("advanced")) {
      risks.push({
        category: "technical",
        risk: "High technical complexity",
        impact: "high",
        probability: "medium",
        mitigation: "Break down into smaller components, conduct proof of concept"
      });
      riskScore += 3;
    }

    if (timeline && timeline.toLowerCase().includes("aggressive") || timeline && timeline.toLowerCase().includes("tight")) {
      risks.push({
        category: "operational",
        risk: "Aggressive timeline",
        impact: "high",
        probability: "high",
        mitigation: "Prioritize MVP features, consider phased delivery"
      });
      riskScore += 4;
    }

    if (team.length < 3) {
      risks.push({
        category: "operational",
        risk: "Small team size",
        impact: "medium",
        probability: "high",
        mitigation: "Consider outsourcing or hiring additional resources"
      });
      riskScore += 2;
    }

    if (dependencies.length > 3) {
      risks.push({
        category: "external",
        risk: "High external dependencies",
        impact: "medium",
        probability: "medium",
        mitigation: "Identify backup options, negotiate SLAs"
      });
      riskScore += 2;
    }

    let riskLevel = "low";
    if (riskScore >= 8) riskLevel = "high";
    else if (riskScore >= 5) riskLevel = "medium";

    const recommendations = [];
    if (riskLevel === "high") {
      recommendations.push("Consider reducing scope or extending timeline");
      recommendations.push("Implement comprehensive risk monitoring");
      recommendations.push("Prepare contingency plans");
    } else if (riskLevel === "medium") {
      recommendations.push("Monitor key risk indicators");
      recommendations.push("Prepare mitigation strategies");
    } else {
      recommendations.push("Continue with current plan");
      recommendations.push("Regular risk reviews");
    }

    return {
      riskLevel,
      riskScore,
      risks,
      recommendations,
      categories: riskCategories,
      message: `Risk assessment completed: ${riskLevel} risk level with ${risks.length} identified risks`
    };
  },
});
