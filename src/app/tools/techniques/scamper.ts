import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const scamperTool = createTool({
  name: "apply_scamper",
  description: "Apply SCAMPER technique to generate creative variations of an idea",
  schema: z.object({
    idea: z.string().describe("The original idea to explore"),
    technique: z.enum([
      "substitute", 
      "combine", 
      "adapt", 
      "modify", 
      "put_to_other_use", 
      "eliminate", 
      "reverse"
    ]).describe("Which SCAMPER technique to apply"),
    context: z.string().optional().describe("Additional context about the idea")
  }),
  fn: async ({ idea, technique }, toolContext) => {
    const scamperQuestions = {
      substitute: "What can I substitute or swap in this idea?",
      combine: "What can I combine this idea with?",
      adapt: "What can I adapt or borrow from other contexts?",
      modify: "What can I modify, magnify, or minimize?",
      put_to_other_use: "What other uses or purposes could this have?",
      eliminate: "What can I eliminate or remove?",
      reverse: "What if I reversed or rearranged this idea?"
    };

    const question = scamperQuestions[technique];
    const variations = generateScamperVariations(idea, technique);
    
    const currentIdeas = toolContext.state.get("discovery_ideas", []);
    const conversationHistory = toolContext.state.get("conversation_history", []);
    
    const newIdeas = variations.map((variation: any, index: any) => ({
      id: `idea_${Date.now()}_${index}`,
      title: `${technique.charAt(0).toUpperCase() + technique.slice(1)} variation of ${idea}`,
      description: variation,
      rationale: `Generated using SCAMPER ${technique} technique`,
      category: "SCAMPER",
      tags: ["scamper", technique],
      source: "scamper_tool",
      confidence: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    toolContext.state.set("discovery_ideas", [...currentIdeas, ...newIdeas]);
    toolContext.state.set("conversation_history", [
      ...conversationHistory,
      {
        type: "technique_application",
        technique: "SCAMPER",
        subTechnique: technique,
        idea: idea,
        variations: variations,
        timestamp: new Date().toISOString()
      }
    ]);

    try {
      await toolContext.saveArtifact(
        `scamper_${technique}_${Date.now()}.json`,
        { text: JSON.stringify(newIdeas, null, 2) }
      );
    } catch (error) {
      console.warn("Failed to save SCAMPER ideas as artifact:", error);
    }
    
    return {
      originalIdea: idea,
      technique: technique,
      question: question,
      variations: variations,
      insights: `SCAMPER ${technique} analysis for: ${idea}`,
      totalIdeas: currentIdeas.length + newIdeas.length,
      message: `Generated ${variations.length} variations using ${technique} technique`,
      savedIdeas: newIdeas.length
    };
  }
});

function generateScamperVariations(idea: string, technique: string): string[] {
  const variations = {
    substitute: [
      `${idea} but with different materials or components`,
      `${idea} but with different people or roles`,
      `${idea} but in a different location or context`,
      `${idea} but with alternative technology`,
      `${idea} but with different business models`
    ],
    combine: [
      `${idea} + mobile app integration`,
      `${idea} + AI technology enhancement`,
      `${idea} + social media features`,
      `${idea} + gamification elements`,
      `${idea} + subscription model`,
      `${idea} + community features`
    ],
    adapt: [
      `${idea} adapted for remote work environments`,
      `${idea} adapted for senior users`,
      `${idea} adapted for sustainability goals`,
      `${idea} adapted for emerging markets`,
      `${idea} adapted for accessibility needs`,
      `${idea} adapted for different industries`
    ],
    modify: [
      `Larger, enterprise-scale version of ${idea}`,
      `Smaller, portable version of ${idea}`,
      `Faster, real-time version of ${idea}`,
      `Simplified, user-friendly version of ${idea}`,
      `Premium, high-end version of ${idea}`,
      `Automated version of ${idea}`
    ],
    put_to_other_use: [
      `${idea} for educational purposes`,
      `${idea} for entertainment and gaming`,
      `${idea} for healthcare applications`,
      `${idea} for environmental monitoring`,
      `${idea} for disaster response`,
      `${idea} for creative industries`
    ],
    eliminate: [
      `${idea} without the complex technical requirements`,
      `${idea} without the expensive components`,
      `${idea} without the manual processes`,
      `${idea} without the traditional barriers`,
      `${idea} without the unnecessary features`,
      `${idea} without the geographical limitations`
    ],
    reverse: [
      `Reverse the traditional process of ${idea}`,
      `Start from the end result of ${idea}`,
      `Do the opposite of conventional ${idea}`,
      `Flip the user experience of ${idea}`,
      `Invert the business model of ${idea}`,
      `Reverse the decision-making flow of ${idea}`
    ]
  };
  
  return variations[technique as keyof typeof variations] || [`${idea} variation`];
}