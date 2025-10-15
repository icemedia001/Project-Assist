import { createTool } from "@iqai/adk";
import { z } from "zod";

export const clusterIdeasTool = createTool({
  name: "cluster_ideas",
  description: "Group related ideas into thematic clusters using LLM-based analysis",
  schema: z.object({
    ideas: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      rationale: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    })).describe("Array of ideas to cluster"),
    maxClusters: z.number().default(5).describe("Maximum number of clusters to create"),
    context: z.string().optional().describe("Additional context about the ideas or clustering goals")
  }),
  fn: ({ ideas, maxClusters, context }, toolContext) => {
    const clusters = generateIdeaClusters(ideas, maxClusters, context);
    
    const currentClusters = toolContext.state.get("idea_clusters", []);
    const newClusters = {
      id: Date.now(),
      clusters: clusters,
      totalIdeas: ideas.length,
      timestamp: new Date().toISOString(),
      context: context
    };
    toolContext.state.set("idea_clusters", [...currentClusters, newClusters]);
    
    return {
      clusters: clusters,
      totalIdeas: ideas.length,
      clusterCount: clusters.length,
      insights: `Grouped ${ideas.length} ideas into ${clusters.length} thematic clusters`,
      message: `Successfully clustered ideas into ${clusters.length} groups based on themes and relationships`
    };
  }
});

function generateIdeaClusters(ideas: any[], maxClusters: number, context?: string): any[] {
  const clusters: any[] = [];
  
  const themes = analyzeThemes(ideas);
  
  themes.slice(0, maxClusters).forEach((theme, index) => {
    const clusterIdeas = ideas.filter(idea => 
      matchesTheme(idea, theme) || 
      idea.tags?.some((tag: string) => theme.keywords.includes(tag.toLowerCase()))
    );
    
    if (clusterIdeas.length > 0) {
      clusters.push({
        id: `cluster_${index + 1}`,
        name: theme.name,
        description: theme.description,
        ideas: clusterIdeas.map(idea => idea.id),
        theme: theme.name,
        color: getClusterColor(index),
        insights: theme.insights,
        priority: calculateClusterPriority(clusterIdeas),
        size: clusterIdeas.length
      });
    }
  });
  
  const clusteredIdeaIds = new Set(clusters.flatMap(c => c.ideas));
  const unclusteredIdeas = ideas.filter(idea => !clusteredIdeaIds.has(idea.id));
  
  if (unclusteredIdeas.length > 0 && clusters.length < maxClusters) {
    clusters.push({
      id: `cluster_${clusters.length + 1}`,
      name: "Other Ideas",
      description: "Ideas that don't fit into the main thematic clusters",
      ideas: unclusteredIdeas.map(idea => idea.id),
      theme: "Miscellaneous",
      color: "#6B7280",
      insights: "These ideas may represent unique opportunities or need further exploration",
      priority: "medium",
      size: unclusteredIdeas.length
    });
  }
  
  return clusters;
}

function analyzeThemes(ideas: any[]): any[] {
  const themePatterns = [
    {
      name: "User Experience & Interface",
      keywords: ["user", "interface", "experience", "design", "ui", "ux", "usability", "accessibility"],
      description: "Ideas focused on improving user interaction and experience",
      insights: "Strong focus on user-centric design and experience optimization"
    },
    {
      name: "Technology & Innovation",
      keywords: ["technology", "ai", "machine learning", "automation", "blockchain", "iot", "api", "integration"],
      description: "Ideas leveraging new technologies and technical innovation",
      insights: "Emphasis on cutting-edge technology and technical solutions"
    },
    {
      name: "Business & Revenue",
      keywords: ["business", "revenue", "monetization", "pricing", "subscription", "market", "sales", "growth"],
      description: "Ideas focused on business model and revenue generation",
      insights: "Strong business orientation with focus on sustainable revenue"
    },
    {
      name: "Social & Community",
      keywords: ["social", "community", "collaboration", "sharing", "network", "engagement", "communication"],
      description: "Ideas that enhance social interaction and community building",
      insights: "Community-driven approach with emphasis on social value"
    },
    {
      name: "Content & Media",
      keywords: ["content", "media", "video", "audio", "streaming", "publishing", "creation", "distribution"],
      description: "Ideas related to content creation, management, and distribution",
      insights: "Content-focused solutions with media and publishing emphasis"
    },
    {
      name: "Data & Analytics",
      keywords: ["data", "analytics", "insights", "reporting", "metrics", "tracking", "monitoring", "dashboard"],
      description: "Ideas focused on data collection, analysis, and insights",
      insights: "Data-driven approach with emphasis on measurement and optimization"
    },
    {
      name: "Mobile & Accessibility",
      keywords: ["mobile", "app", "responsive", "accessibility", "portable", "on-the-go", "location"],
      description: "Ideas optimized for mobile devices and accessibility",
      insights: "Mobile-first thinking with accessibility considerations"
    },
    {
      name: "Security & Privacy",
      keywords: ["security", "privacy", "encryption", "authentication", "compliance", "protection", "safe"],
      description: "Ideas focused on security, privacy, and data protection",
      insights: "Security-conscious approach with privacy-first design"
    }
  ];
  
  const scoredThemes = themePatterns.map(theme => {
    let score = 0;
    let matchingIdeas = 0;
    
    ideas.forEach(idea => {
      const ideaText = `${idea.title} ${idea.description} ${idea.rationale || ''}`.toLowerCase();
      const ideaTags = idea.tags?.map((tag: string) => tag.toLowerCase()) || [];
      
      const keywordMatches = theme.keywords.filter(keyword => 
        ideaText.includes(keyword) || ideaTags.includes(keyword)
      ).length;
      
      if (keywordMatches > 0) {
        score += keywordMatches;
        matchingIdeas++;
      }
    });
    
    return {
      ...theme,
      score,
      matchingIdeas,
      relevance: matchingIdeas / ideas.length
    };
  });
  
  return scoredThemes
    .filter(theme => theme.matchingIdeas > 0)
    .sort((a, b) => (b.score * b.relevance) - (a.score * a.relevance));
}

function matchesTheme(idea: any, theme: any): boolean {
  const ideaText = `${idea.title} ${idea.description} ${idea.rationale || ''}`.toLowerCase();
  const ideaTags = idea.tags?.map((tag: string) => tag.toLowerCase()) || [];
  
  return theme.keywords.some((keyword: string) => 
    ideaText.includes(keyword) || ideaTags.includes(keyword)
  );
}

function getClusterColor(index: number): string {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316"
  ];
  return colors[index % colors.length];
}

function calculateClusterPriority(ideas: any[]): string {
  if (ideas.length >= 5) return "high";
  if (ideas.length >= 3) return "medium";
  return "low";
}
