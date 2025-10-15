import { createTool } from '@iqai/adk';
import { z } from 'zod';

/**
 * Idea Manager Tool - Consistent state management for ideas
 * This tool provides a unified interface for managing ideas across all techniques
 */

export const saveIdeaTool = createTool({
  name: "save_idea",
  description: "Save an idea with consistent metadata and state management",
  schema: z.object({
    title: z.string().describe("Title of the idea"),
    description: z.string().describe("Detailed description of the idea"),
    rationale: z.string().optional().describe("Why this idea is valuable"),
    category: z.string().optional().describe("Category or type of idea"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    source: z.string().optional().describe("Source technique or method"),
    confidence: z.number().min(1).max(10).optional().describe("Confidence level (1-10)")
  }),
  fn: async ({ title, description, rationale, category, tags, source, confidence }, context) => {
    const idea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      rationale: rationale || "Generated during discovery session",
      category: category || "General",
      tags: tags || [],
      source: source || "manual",
      confidence: confidence || 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentIdeas = context.state.get("discovery_ideas", []);
    
    const updatedIdeas = [...currentIdeas, idea];
    
    context.state.set("discovery_ideas", updatedIdeas);
    context.state.set("last_idea_saved", new Date().toISOString());
    context.state.set("total_ideas", updatedIdeas.length);

    try {
      await context.saveArtifact(
        `idea_${idea.id}.json`,
        { text: JSON.stringify(idea, null, 2) }
      );
    } catch (error) {
      console.warn("Failed to save idea as artifact:", error);
    }

    return {
      success: true,
      idea,
      totalIdeas: updatedIdeas.length,
      message: `✅ Saved idea: "${title}" (${updatedIdeas.length} total ideas)`
    };
  }
});

export const getIdeasTool = createTool({
  name: "get_ideas",
  description: "Retrieve all ideas from the current session",
  schema: z.object({
    category: z.string().optional().describe("Filter by category"),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    source: z.string().optional().describe("Filter by source technique")
  }),
  fn: ({ category, tags, source }, context) => {
    let ideas = context.state.get("discovery_ideas", []);

    if (category) {
      ideas = ideas.filter((idea: any) => idea.category === category);
    }
    
    if (tags && tags.length > 0) {
      ideas = ideas.filter((idea: any) => 
        tags.some(tag => idea.tags.includes(tag))
      );
    }
    
    if (source) {
      ideas = ideas.filter((idea: any) => idea.source === source);
    }

    return {
      ideas,
      totalCount: ideas.length,
      filters: { category, tags, source },
      message: `Found ${ideas.length} ideas matching criteria`
    };
  }
});

export const updateIdeaTool = createTool({
  name: "update_idea",
  description: "Update an existing idea",
  schema: z.object({
    ideaId: z.string().describe("ID of the idea to update"),
    updates: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      rationale: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      confidence: z.number().min(1).max(10).optional()
    }).describe("Fields to update")
  }),
  fn: async ({ ideaId, updates }, context) => {
    const ideas = context.state.get("discovery_ideas", []);
    const ideaIndex = ideas.findIndex((idea: any) => idea.id === ideaId);

    if (ideaIndex === -1) {
      return {
        success: false,
        error: "Idea not found",
        message: `No idea found with ID: ${ideaId}`
      };
    }

    const updatedIdea = {
      ...ideas[ideaIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    ideas[ideaIndex] = updatedIdea;
    context.state.set("discovery_ideas", ideas);

    try {
      await context.saveArtifact(
        `idea_${ideaId}_updated.json`,
        { text: JSON.stringify(updatedIdea, null, 2) }
      );
    } catch (error) {
      console.warn("Failed to save updated idea as artifact:", error);
    }

    return {
      success: true,
      idea: updatedIdea,
      message: `✅ Updated idea: "${updatedIdea.title}"`
    };
  }
});

export const deleteIdeaTool = createTool({
  name: "delete_idea",
  description: "Delete an idea from the session",
  schema: z.object({
    ideaId: z.string().describe("ID of the idea to delete")
  }),
  fn: ({ ideaId }, context) => {
    const ideas = context.state.get("discovery_ideas", []);
    const filteredIdeas = ideas.filter((idea: any) => idea.id !== ideaId);

    if (filteredIdeas.length === ideas.length) {
      return {
        success: false,
        error: "Idea not found",
        message: `No idea found with ID: ${ideaId}`
      };
    }

    context.state.set("discovery_ideas", filteredIdeas);
    context.state.set("total_ideas", filteredIdeas.length);

    return {
      success: true,
      deletedId: ideaId,
      totalIdeas: filteredIdeas.length,
      message: `✅ Deleted idea with ID: ${ideaId}`
    };
  }
});

export const ideaManagementTools = () => [
  saveIdeaTool,
  getIdeasTool,
  updateIdeaTool,
  deleteIdeaTool
];
