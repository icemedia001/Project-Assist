import { createTool } from "@iqai/adk";
import { z } from "zod";

export const scoreIdeasTool = createTool({
  name: "score_ideas",
  description: "Score ideas on multiple criteria using LLM-based analysis for impact, feasibility, and effort",
  schema: z.object({
    ideas: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      rationale: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    })).describe("Array of ideas to score"),
    criteria: z.object({
      impact: z.object({
        weight: z.number().default(0.4).describe("Weight for impact scoring (0-1)"),
        factors: z.array(z.string()).default(["user_value", "market_potential", "innovation_level", "social_impact"])
      }),
      feasibility: z.object({
        weight: z.number().default(0.3).describe("Weight for feasibility scoring (0-1)"),
        factors: z.array(z.string()).default(["technical_complexity", "resource_requirements", "timeline", "risk_level"])
      }),
      effort: z.object({
        weight: z.number().default(0.3).describe("Weight for effort scoring (0-1)"),
        factors: z.array(z.string()).default(["development_time", "team_size", "cost", "maintenance"])
      })
    }).optional().describe("Scoring criteria and weights"),
    context: z.string().optional().describe("Additional context for scoring (market conditions, resources, etc.)")
  }),
  fn: ({ ideas, criteria, context }, toolContext) => {
    const scoringCriteria = criteria || {
      impact: { weight: 0.4, factors: ["user_value", "market_potential", "innovation_level", "social_impact"] },
      feasibility: { weight: 0.3, factors: ["technical_complexity", "resource_requirements", "timeline", "risk_level"] },
      effort: { weight: 0.3, factors: ["development_time", "team_size", "cost", "maintenance"] }
    };
    
    const scoredIdeas = ideas.map(idea => scoreIdea(idea, scoringCriteria, context));
    
    const sortedIdeas = scoredIdeas.sort((a, b) => b.priority - a.priority);
    
    const currentScores = toolContext.state.get("scored_ideas", []);
    const newScores = {
      id: Date.now(),
      ideas: sortedIdeas,
      criteria: scoringCriteria,
      timestamp: new Date().toISOString(),
      context: context
    };
    toolContext.state.set("scored_ideas", [...currentScores, newScores]);
    
    return {
      scoredIdeas: sortedIdeas,
      totalIdeas: ideas.length,
      topIdeas: sortedIdeas.slice(0, 3),
      insights: generateScoringInsights(sortedIdeas),
      message: `Successfully scored ${ideas.length} ideas using multi-criteria analysis`
    };
  }
});

function scoreIdea(idea: any, criteria: any, context?: string): any {
  const impactScore = calculateImpactScore(idea, criteria.impact, context);
  const feasibilityScore = calculateFeasibilityScore(idea, criteria.feasibility, context);
  const effortScore = calculateEffortScore(idea, criteria.effort, context);
  
  const priority = (
    impactScore * criteria.impact.weight +
    feasibilityScore * criteria.feasibility.weight +
    (10 - effortScore) * criteria.effort.weight
  );
  
  return {
    ...idea,
    impact: impactScore,
    feasibility: feasibilityScore,
    effort: effortScore,
    priority: Math.round(priority * 10) / 10,
    reasoning: {
      impact: generateImpactReasoning(idea, impactScore),
      feasibility: generateFeasibilityReasoning(idea, feasibilityScore),
      effort: generateEffortReasoning(idea, effortScore)
    }
  };
}

function calculateImpactScore(idea: any, impactCriteria: any, context?: string): number {
  let score = 5;
  
  const ideaText = `${idea.title} ${idea.description} ${idea.rationale || ''}`.toLowerCase();
  const ideaTags = idea.tags?.map((tag: any) => tag.toLowerCase()) || [];
  
  const userValueKeywords = ["user", "customer", "experience", "satisfaction", "pain", "problem", "need"];
  const userValueScore = userValueKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(userValueScore * 0.5, 2);
  
  const marketKeywords = ["market", "revenue", "business", "growth", "scale", "demand", "opportunity"];
  const marketScore = marketKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(marketScore * 0.4, 1.5);
  
  const innovationKeywords = ["ai", "machine learning", "blockchain", "iot", "automation", "innovation", "cutting-edge"];
  const innovationScore = innovationKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(innovationScore * 0.3, 1);
  
  const socialKeywords = ["social", "community", "sustainability", "accessibility", "inclusion", "impact", "benefit"];
  const socialScore = socialKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(socialScore * 0.2, 0.5);
  
  return Math.min(Math.max(score, 1), 10);
}

function calculateFeasibilityScore(idea: any, feasibilityCriteria: any, context?: string): number {
  let score = 5;
  
  const ideaText = `${idea.title} ${idea.description} ${idea.rationale || ''}`.toLowerCase();
  const ideaTags = idea.tags?.map((tag: any) => tag.toLowerCase()) || [];
  
  const complexKeywords = ["ai", "machine learning", "blockchain", "iot", "complex", "advanced", "sophisticated"];
  const complexScore = complexKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score -= Math.min(complexScore * 0.5, 2);
  
  const resourceKeywords = ["team", "resources", "budget", "investment", "infrastructure", "equipment"];
  const resourceScore = resourceKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score -= Math.min(resourceScore * 0.3, 1.5);
  
  const timelineKeywords = ["quick", "fast", "simple", "easy", "rapid", "immediate"];
  const timelineScore = timelineKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(timelineScore * 0.4, 1.5);
  
  const riskKeywords = ["risk", "uncertainty", "experimental", "unproven", "challenging"];
  const riskScore = riskKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score -= Math.min(riskScore * 0.4, 1.5);
  
  return Math.min(Math.max(score, 1), 10);
}

function calculateEffortScore(idea: any, effortCriteria: any, context?: string): number {
  let score = 5;
  
  const ideaText = `${idea.title} ${idea.description} ${idea.rationale || ''}`.toLowerCase();
  const ideaTags = idea.tags?.map((tag: any) => tag.toLowerCase()) || [];
  
  const timeKeywords = ["long", "extensive", "comprehensive", "detailed", "complex", "sophisticated"];
  const timeScore = timeKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(timeScore * 0.5, 2);
  
  const teamKeywords = ["team", "collaboration", "multiple", "various", "diverse", "cross-functional"];
  const teamScore = teamKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(teamScore * 0.3, 1.5);
  
  const costKeywords = ["expensive", "costly", "investment", "budget", "premium", "high-end"];
  const costScore = costKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(costScore * 0.4, 1.5);
  
  const maintenanceKeywords = ["ongoing", "continuous", "regular", "maintenance", "updates", "support"];
  const maintenanceScore = maintenanceKeywords.filter(keyword => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  ).length;
  score += Math.min(maintenanceScore * 0.2, 1);
  
  return Math.min(Math.max(score, 1), 10);
}

function generateImpactReasoning(idea: any, score: number): string {
  if (score >= 8) return `High impact potential: ${idea.title} addresses significant user needs and has strong market potential.`;
  if (score >= 6) return `Moderate impact potential: ${idea.title} provides value but may need refinement for maximum impact.`;
  if (score >= 4) return `Limited impact potential: ${idea.title} has some value but may not address core user needs effectively.`;
  return `Low impact potential: ${idea.title} may not provide sufficient value to justify development effort.`;
}

function generateFeasibilityReasoning(idea: any, score: number): string {
  if (score >= 8) return `Highly feasible: ${idea.title} can be implemented with current resources and technology.`;
  if (score >= 6) return `Moderately feasible: ${idea.title} is achievable but may require additional resources or expertise.`;
  if (score >= 4) return `Challenging feasibility: ${idea.title} presents significant technical or resource challenges.`;
  return `Low feasibility: ${idea.title} may be too complex or resource-intensive to implement successfully.`;
}

function generateEffortReasoning(idea: any, score: number): string {
  if (score <= 3) return `Low effort required: ${idea.title} can be implemented quickly with minimal resources.`;
  if (score <= 5) return `Moderate effort required: ${idea.title} needs reasonable time and resource investment.`;
  if (score <= 7) return `High effort required: ${idea.title} demands significant time, team, and resource commitment.`;
  return `Very high effort required: ${idea.title} is a major undertaking requiring extensive resources and long timeline.`;
}

function generateScoringInsights(scoredIdeas: any[]): string {
  const topIdea = scoredIdeas[0];
  const avgImpact = scoredIdeas.reduce((sum, idea) => sum + idea.impact, 0) / scoredIdeas.length;
  const avgFeasibility = scoredIdeas.reduce((sum, idea) => sum + idea.feasibility, 0) / scoredIdeas.length;
  const avgEffort = scoredIdeas.reduce((sum, idea) => sum + idea.effort, 0) / scoredIdeas.length;
  
  return `Top idea: ${topIdea.title} (Priority: ${topIdea.priority}). Average scores - Impact: ${avgImpact.toFixed(1)}, Feasibility: ${avgFeasibility.toFixed(1)}, Effort: ${avgEffort.toFixed(1)}. Consider focusing on high-impact, feasible ideas with manageable effort requirements.`;
}
