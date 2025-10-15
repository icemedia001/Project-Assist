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

function generateDiscoveryReport(sessionData: any, format: string, includeVisualizations: boolean): string {
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
  let report = `# ${title}\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `---\n\n`;
  
  report += `## Executive Summary\n\n`;
  report += `This discovery session explored "${sessionData.problemStatement}" using ${sessionData.techniquesUsed.join(", ")} techniques. `;
  report += `We generated ${sessionData.ideas.length} ideas, organized them into ${sessionData.clusters?.length || 0} thematic clusters, `;
  report += `and prioritized them based on impact, feasibility, and effort analysis.\n\n`;
  
  report += `## Problem Statement\n\n`;
  report += `${sessionData.problemStatement}\n\n`;
  
  report += `## Brainstorming Techniques\n\n`;
  sessionData.techniquesUsed.forEach((technique: any) => {
    report += `- **${technique}**: ${getTechniqueDescription(technique)}\n`;
  });
  report += `\n`;
  
  report += `## Ideas Generated (${sessionData.ideas.length} total)\n\n`;
  sessionData.ideas.forEach((idea: any, index: number) => {
    report += `### ${index + 1}. ${idea.title}\n\n`;
    report += `${idea.description}\n\n`;
    if (idea.rationale) {
      report += `**Rationale:** ${idea.rationale}\n\n`;
    }
    if (idea.tags && idea.tags.length > 0) {
      report += `**Tags:** ${idea.tags.join(", ")}\n\n`;
    }
  });
  
  if (sessionData.clusters && sessionData.clusters.length > 0) {
    report += `## Idea Clusters\n\n`;
    sessionData.clusters.forEach((cluster: any) => {
      report += `### ${cluster.name}\n\n`;
      report += `${cluster.description}\n\n`;
      report += `**Priority:** ${cluster.priority}\n\n`;
      report += `**Ideas in this cluster:**\n`;
      cluster.ideas.forEach((ideaId: string) => {
        const idea = sessionData.ideas.find((i: any) => i.id === ideaId);
        if (idea) {
          report += `- ${idea.title}\n`;
        }
      });
      report += `\n`;
    });
  }
  
  if (sessionData.scoredIdeas && sessionData.scoredIdeas.length > 0) {
    report += `## Prioritized Ideas\n\n`;
    report += `Ideas ranked by priority score (impact × feasibility × effort):\n\n`;
    
    sessionData.scoredIdeas.slice(0, 10).forEach((idea: any, index: number) => {
      report += `### ${index + 1}. ${idea.title} (Priority: ${idea.priority})\n\n`;
      report += `- **Impact:** ${idea.impact}/10\n`;
      report += `- **Feasibility:** ${idea.feasibility}/10\n`;
      report += `- **Effort:** ${idea.effort}/10\n\n`;
    });
  }
  
  if (includeVisualizations) {
    report += `## Visualizations\n\n`;
    
    if (sessionData.ideas.length > 0) {
      report += `### Ideas by Category\n\n`;
      report += `\`\`\`mermaid\n`;
      report += `pie title Ideas by Category\n`;
      const categories = getCategoryDistribution(sessionData.ideas);
      categories.forEach(cat => {
        report += `  "${cat.name}" : ${cat.count}\n`;
      });
      report += `\`\`\`\n\n`;
    }
    
    if (sessionData.scoredIdeas && sessionData.scoredIdeas.length > 0) {
      report += `### Priority Matrix\n\n`;
      report += `\`\`\`mermaid\n`;
      report += `quadrantChart\n`;
      report += `  title Priority Matrix (Impact vs Feasibility)\n`;
      report += `  x-axis Low Feasibility --> High Feasibility\n`;
      report += `  y-axis Low Impact --> High Impact\n`;
      sessionData.scoredIdeas.slice(0, 8).forEach((idea: any) => {
        report += `  "${idea.title}": [${idea.feasibility}, ${idea.impact}]\n`;
      });
      report += `\`\`\`\n\n`;
    }
  }
  
  report += `## Key Insights\n\n`;
  report += generateReportInsights(sessionData);
  report += `\n\n`;
  
  report += `## Recommendations\n\n`;
  report += generateRecommendations(sessionData);
  report += `\n\n`;
  
  report += `## Next Steps\n\n`;
  report += `1. **Validate top ideas** with user research and market analysis\n`;
  report += `2. **Create detailed specifications** for high-priority concepts\n`;
  report += `3. **Develop prototypes** for the most promising ideas\n`;
  report += `4. **Conduct feasibility studies** for complex technical solutions\n`;
  report += `5. **Plan implementation roadmap** with clear milestones\n\n`;
  
  report += `---\n\n`;
  report += `*Report generated by Discovery System*\n`;
  
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
