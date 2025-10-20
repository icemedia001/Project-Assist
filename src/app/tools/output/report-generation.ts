import { createTool } from "@iqai/adk";
import { z } from "zod";

export const generateDiscoveryReportTool = createTool({
  name: "generate_discovery_report",
  description: "Generate a comprehensive discovery report from session data and analysis results",
  schema: z.object({
    sessionData: z.object({
      problemStatement: z.string().describe("The original problem or challenge"),
      techniquesUsed: z.array(z.string()).describe("Brainstorming techniques applied"),
      ideas: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        rationale: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional()
      })).describe("Generated ideas"),
      clusters: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        ideas: z.array(z.string()),
        theme: z.string(),
        priority: z.string()
      })).optional().describe("Idea clusters"),
      scoredIdeas: z.array(z.object({
        id: z.string(),
        title: z.string(),
        impact: z.number(),
        feasibility: z.number(),
        effort: z.number(),
        priority: z.number()
      })).optional().describe("Scored and prioritized ideas"),
      context: z.string().optional().describe("Additional session context")
    }).describe("Complete session data for report generation"),
    format: z.enum(["markdown", "yaml", "json"]).default("markdown").describe("Output format for the report"),
    includeVisualizations: z.boolean().default(true).describe("Whether to include Mermaid diagrams and visualizations")
  }),
  fn: ({ sessionData, format, includeVisualizations }, toolContext) => {
    const report = generateDiscoveryReport(sessionData, format, includeVisualizations);
    
    const currentReports = toolContext.state.get("discovery_reports", []);
    const newReport = {
      id: Date.now(),
      sessionData: sessionData,
      report: report,
      format: format,
      timestamp: new Date().toISOString()
    };
    toolContext.state.set("discovery_reports", [...currentReports, newReport]);
    
    return {
      report: report,
      format: format,
      insights: generateReportInsights(sessionData),
      recommendations: generateRecommendations(sessionData),
      message: `Successfully generated ${format} discovery report with ${sessionData.ideas.length} ideas`
    };
  }
});

export function generateDiscoveryReport(sessionData: any, format: string, includeVisualizations: boolean = false): string {
  const timestamp = new Date().toISOString();
  const reportTitle = `Discovery Report: ${sessionData.problemStatement}`;
  
  if (format === "markdown") {
    return generateMarkdownReport(sessionData, reportTitle, timestamp, includeVisualizations);
  } else if (format === "yaml") {
    return generateYamlReport(sessionData, reportTitle, timestamp);
  } else {
    return generateJsonReport(sessionData, reportTitle, timestamp);
  }
}

function generateMarkdownReport(sessionData: any, title: string, timestamp: string, includeVisualizations: boolean): string {
  const sessionDate = new Date(timestamp).toLocaleDateString();
  const agentRole = "Discovery Agent";
  const agentName = "Project Assist";
  const userName = "Participant";
  
  let report = `# Brainstorming Session Results\n\n`;
  report += `**Session Date:** ${sessionDate}\n`;
  report += `**Facilitator:** ${agentRole} ${agentName}\n`;
  report += `**Participant:** ${userName}\n\n`;
  
  report += `## Executive Summary\n\n`;
  report += `**Topic:** ${sessionData.problemStatement}\n\n`;
  report += `**Session Goals:** ${sessionData.context || "Explore and generate innovative ideas"}\n\n`;
  report += `**Techniques Used:** ${sessionData.techniquesUsed.length > 0 ? sessionData.techniquesUsed.join(", ") : "Discovery session"}\n\n`;
  report += `**Total Ideas Generated:** ${sessionData.ideas.length}\n\n`;
  
  if (sessionData.clusters && sessionData.clusters.length > 0) {
    report += `**Key Themes Identified:**\n`;
    sessionData.clusters.forEach((cluster: any) => {
      report += `- ${cluster.name}\n`;
    });
    report += `\n`;
  }
  
  if (sessionData.techniquesUsed && sessionData.techniquesUsed.length > 0) {
    report += `## Technique Sessions\n\n`;
    sessionData.techniquesUsed.forEach((technique: string, index: number) => {
      report += `### ${technique} - Session ${index + 1}\n\n`;
      report += `**Description:** ${getTechniqueDescription(technique)}\n\n`;
      
      const techniqueIdeas = sessionData.ideas.filter((idea: any) => 
        idea.tags && idea.tags.includes(technique.toLowerCase())
      );
      
      if (techniqueIdeas.length > 0) {
        report += `**Ideas Generated:**\n`;
        techniqueIdeas.forEach((idea: any, idx: number) => {
          report += `${idx + 1}. ${idea.title}\n`;
        });
        report += `\n`;
      }
      
      report += `---\n\n`;
    });
  }
  
  report += `## Idea Categorization\n\n`;
  
  const immediateOpportunities = sessionData.ideas.filter((idea: any) => 
    idea.metadata?.feasibility === 'high' && idea.metadata?.impact === 'high'
  );
  const futureInnovations = sessionData.ideas.filter((idea: any) => 
    idea.metadata?.feasibility === 'medium' || idea.metadata?.impact === 'high'
  );
  const moonshots = sessionData.ideas.filter((idea: any) => 
    idea.metadata?.feasibility === 'low' && idea.metadata?.impact === 'high'
  );
  
  if (immediateOpportunities.length > 0) {
    report += `### Immediate Opportunities\n`;
    report += `*Ideas ready to implement now*\n\n`;
    immediateOpportunities.forEach((idea: any, index: number) => {
      report += `${index + 1}. **${idea.title}**\n`;
      report += `   - Description: ${idea.description}\n`;
      report += `   - Why immediate: ${idea.rationale || "High feasibility and impact"}\n`;
      report += `   - Resources needed: ${idea.metadata?.resources || "Standard development resources"}\n\n`;
    });
  }
  
  if (futureInnovations.length > 0) {
    report += `### Future Innovations\n`;
    report += `*Ideas requiring development/research*\n\n`;
    futureInnovations.forEach((idea: any, index: number) => {
      report += `${index + 1}. **${idea.title}**\n`;
      report += `   - Description: ${idea.description}\n`;
      report += `   - Development needed: ${idea.metadata?.development || "Research and development required"}\n`;
      report += `   - Timeline estimate: ${idea.metadata?.timeline || "3-6 months"}\n\n`;
    });
  }
  
  if (moonshots.length > 0) {
    report += `### Moonshots\n`;
    report += `*Ambitious, transformative concepts*\n\n`;
    moonshots.forEach((idea: any, index: number) => {
      report += `${index + 1}. **${idea.title}**\n`;
      report += `   - Description: ${idea.description}\n`;
      report += `   - Transformative potential: ${idea.metadata?.potential || "High transformative impact"}\n`;
      report += `   - Challenges to overcome: ${idea.metadata?.challenges || "Significant technical and resource challenges"}\n\n`;
    });
  }
  
  report += `### Insights & Learnings\n`;
  report += `*Key realizations from the session*\n\n`;
  const insights = generateSessionInsights(sessionData);
  insights.forEach(insight => {
    report += `- ${insight}\n`;
  });
  report += `\n`;
  
  report += `## Action Planning\n\n`;
  
  const topIdeas = sessionData.ideas.slice(0, 3);
  if (topIdeas.length > 0) {
    report += `### Top ${Math.min(3, topIdeas.length)} Priority Ideas\n\n`;
    topIdeas.forEach((idea: any, index: number) => {
      report += `#### #${index + 1} Priority: ${idea.title}\n\n`;
      report += `- Rationale: ${idea.rationale || "High potential based on session analysis"}\n`;
      report += `- Next steps: ${idea.metadata?.nextSteps || "Define detailed requirements and create implementation plan"}\n`;
      report += `- Resources needed: ${idea.metadata?.resources || "Development team and project management"}\n`;
      report += `- Timeline: ${idea.metadata?.timeline || "2-4 weeks for initial implementation"}\n\n`;
    });
  }
  
  report += `## Reflection & Follow-up\n\n`;
  
  report += `### What Worked Well\n`;
  report += `- Interactive brainstorming techniques generated diverse ideas\n`;
  report += `- Structured approach helped organize thoughts\n`;
  report += `- Collaborative environment fostered creativity\n\n`;
  
  report += `### Areas for Further Exploration\n`;
  if (sessionData.clusters && sessionData.clusters.length > 0) {
    sessionData.clusters.forEach((cluster: any) => {
      report += `- ${cluster.name}: ${cluster.description}\n`;
    });
  } else {
    report += `- Technical feasibility studies for complex ideas\n`;
    report += `- User research to validate assumptions\n`;
    report += `- Market analysis for commercial viability\n\n`;
  }
  
  report += `### Recommended Follow-up Techniques\n`;
  report += `- User interviews to validate top ideas\n`;
  report += `- Prototyping sessions for technical concepts\n`;
  report += `- Stakeholder workshops for implementation planning\n\n`;
  
  report += `### Questions That Emerged\n`;
  report += `- How do we prioritize ideas with limited resources?\n`;
  report += `- What are the technical constraints for implementation?\n`;
  report += `- How do we measure success for each idea?\n\n`;
  
  report += `### Next Session Planning\n`;
  report += `- **Suggested topics:** Implementation planning, user research, technical feasibility\n`;
  report += `- **Recommended timeframe:** 1-2 weeks\n`;
  report += `- **Preparation needed:** Review this report and select top 3 ideas for detailed analysis\n\n`;
  
  report += `---\n\n`;
  report += `*Report generated by Project Assist*\n`;
  
  return report;
}

function generateYamlReport(sessionData: any, title: string, timestamp: string): string {
  const report = {
    title: title,
    generated: timestamp,
    problem_statement: sessionData.problemStatement,
    techniques_used: sessionData.techniquesUsed,
    ideas: sessionData.ideas,
    clusters: sessionData.clusters || [],
    prioritized_ideas: sessionData.scoredIdeas || [],
    insights: generateReportInsights(sessionData),
    recommendations: generateRecommendations(sessionData).split('\n').filter(line => line.trim())
  };
  
  return `# ${title}\n${JSON.stringify(report, null, 2)}`;
}

function generateJsonReport(sessionData: any, title: string, timestamp: string): string {
  const report = {
    title: title,
    generated: timestamp,
    problem_statement: sessionData.problemStatement,
    techniques_used: sessionData.techniquesUsed,
    ideas: sessionData.ideas,
    clusters: sessionData.clusters || [],
    prioritized_ideas: sessionData.scoredIdeas || [],
    insights: generateReportInsights(sessionData),
    recommendations: generateRecommendations(sessionData).split('\n').filter(line => line.trim())
  };
  
  return JSON.stringify(report, null, 2);
}

function getTechniqueDescription(technique: string): string {
  const descriptions: Record<string, string> = {
    "SCAMPER": "Systematic approach to creative thinking using Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, and Reverse",
    "Six Thinking Hats": "Parallel thinking method using different colored hats to explore ideas from multiple perspectives",
    "Mind Mapping": "Visual technique for organizing and exploring ideas around a central concept",
    "Rolestorming": "Brainstorming technique that adopts different personas to generate diverse perspectives",
    "Why Analysis": "Root cause analysis technique using iterative 'why' questions to understand underlying problems"
  };
  
  return descriptions[technique] || "Creative brainstorming technique for idea generation";
}

function getCategoryDistribution(ideas: any[]): any[] {
  const categories: Record<string, number> = {};
  
  ideas.forEach(idea => {
    const category = idea.category || "Uncategorized";
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return Object.entries(categories).map(([name, count]) => ({ name, count }));
}

function generateReportInsights(sessionData: any): string {
  const insights = [];
  
  insights.push(`Generated ${sessionData.ideas.length} diverse ideas using ${sessionData.techniquesUsed.length} different techniques.`);
  
  if (sessionData.clusters && sessionData.clusters.length > 0) {
    const largestCluster = sessionData.clusters.reduce((max: any, cluster: any) => 
      cluster.ideas.length > max.ideas.length ? cluster : max
    );
    insights.push(`Ideas naturally clustered into ${sessionData.clusters.length} themes, with "${largestCluster.name}" being the largest cluster.`);
  }
  
  if (sessionData.scoredIdeas && sessionData.scoredIdeas.length > 0) {
    const topIdea = sessionData.scoredIdeas[0];
    const avgImpact = sessionData.scoredIdeas.reduce((sum: number, idea: any) => sum + idea.impact, 0) / sessionData.scoredIdeas.length;
    insights.push(`Top priority idea "${topIdea.title}" scored ${topIdea.priority} with average impact of ${avgImpact.toFixed(1)}/10.`);
  }
  
  insights.push(`The combination of ${sessionData.techniquesUsed.join(" and ")} techniques provided comprehensive coverage of the problem space.`);
  
  return insights.join(" ");
}

function generateSessionInsights(sessionData: any): string[] {
  const insights = [];
  
  if (sessionData.ideas.length > 0) {
    insights.push(`Generated ${sessionData.ideas.length} diverse ideas through structured brainstorming`);
  }
  
  if (sessionData.techniquesUsed.length > 1) {
    insights.push(`Multiple techniques (${sessionData.techniquesUsed.join(", ")}) provided comprehensive coverage of the problem space`);
  }
  
  if (sessionData.clusters && sessionData.clusters.length > 0) {
    insights.push(`Ideas naturally clustered into ${sessionData.clusters.length} thematic groups, indicating clear patterns`);
  }
  
  const highImpactIdeas = sessionData.ideas.filter((idea: any) => idea.metadata?.impact === 'high');
  if (highImpactIdeas.length > 0) {
    insights.push(`${highImpactIdeas.length} high-impact ideas identified with significant potential`);
  }
  
  const immediateIdeas = sessionData.ideas.filter((idea: any) => 
    idea.metadata?.feasibility === 'high' && idea.metadata?.impact === 'high'
  );
  if (immediateIdeas.length > 0) {
    insights.push(`${immediateIdeas.length} ideas are ready for immediate implementation`);
  }
  
  if (sessionData.ideas.length === 0) {
    insights.push("Session generated foundational understanding - consider follow-up ideation sessions");
  }
  
  return insights;
}

function generateRecommendations(sessionData: any): string {
  const recommendations = [];
  
  if (sessionData.scoredIdeas && sessionData.scoredIdeas.length > 0) {
    const topIdeas = sessionData.scoredIdeas.slice(0, 3);
    recommendations.push(`Focus on the top 3 ideas: ${topIdeas.map((idea: any) => `"${idea.title}"`).join(", ")}.`);
  }
  
  if (sessionData.clusters && sessionData.clusters.length > 0) {
    const highPriorityClusters = sessionData.clusters.filter((cluster: any) => cluster.priority === "high");
    if (highPriorityClusters.length > 0) {
      recommendations.push(`Prioritize development in high-priority clusters: ${highPriorityClusters.map((c: any) => c.name).join(", ")}.`);
    }
  }
  
  recommendations.push("Conduct user research to validate assumptions and refine the most promising concepts.");
  
  recommendations.push("Create detailed technical specifications and feasibility studies for top ideas.");
  
  return recommendations.join("\n");
}
