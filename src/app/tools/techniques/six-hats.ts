import { createTool } from "@iqai/adk";
import { z } from "zod";

export const sixHatsTool = createTool({
    name: "apply_six_hats",
    description: "Apply Six Thinking Hats technique to analyze an idea from different perspectives",
    schema: z.object({
      idea: z.string().describe("The idea to analyze"),
      hat: z.enum(["white", "red", "black", "yellow", "green", "blue"]).describe("Which thinking hat to wear"),
      context: z.string().optional().describe("Additional context about the idea")
    }),
    fn: ({ idea, hat, context }, toolContext) => {
      const hatPerspectives = {
        white: "Facts and information - What do we know? What do we need to know?",
        red: "Emotions and feelings - What's your gut reaction? How do you feel about this?",
        black: "Critical thinking - What could go wrong? What are the risks and problems?",
        yellow: "Optimistic thinking - What are the benefits? What's the best case scenario?",
        green: "Creative thinking - What are the alternatives? How can we be more creative?",
        blue: "Process control - How should we think about this? What's the big picture?"
      };
  
      const perspective = hatPerspectives[hat];
      const analysis = generateSixHatsAnalysis(idea, hat);
      
      const currentAnalysis = toolContext.state.get("six_hats_analysis", {});
      const conversationHistory = toolContext.state.get("conversation_history", []);
      
      currentAnalysis[hat] = {
        idea: idea,
        perspective: perspective,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
      
      toolContext.state.set("six_hats_analysis", currentAnalysis);
      toolContext.state.set("conversation_history", [
        ...conversationHistory,
        {
          type: "technique_application",
          technique: "Six Thinking Hats",
          subTechnique: hat,
          idea: idea,
          analysis: analysis,
          timestamp: new Date().toISOString()
        }
      ]);
      
      return {
        idea: idea,
        hat: hat,
        perspective: perspective,
        analysis: analysis,
        message: `Analyzed idea from ${hat} hat perspective`
      };
    }
  });

  function generateSixHatsAnalysis(idea: string, hat: string): string {
    const analyses = {
      white: `Facts about ${idea}: This is a concrete concept that can be researched and validated. Key data points include market size, user demographics, technical feasibility, and competitive landscape. We need to gather specific metrics, user research data, and industry benchmarks to support this idea.`,
      red: `Gut feeling about ${idea}: This feels exciting and has potential to make a real impact. There's an emotional connection and intuitive sense that this addresses a real need. The idea sparks enthusiasm and feels personally meaningful. However, we should balance this with objective analysis.`,
      black: `Concerns about ${idea}: Potential challenges include implementation complexity, market competition, resource requirements, technical risks, regulatory hurdles, and user adoption barriers. We need to identify specific failure modes and develop mitigation strategies.`,
      yellow: `Benefits of ${idea}: This could solve real problems and create significant value for users. Potential benefits include improved efficiency, cost savings, enhanced user experience, market opportunities, and positive social impact. The upside potential is substantial.`,
      green: `Creative alternatives to ${idea}: Consider different approaches, technologies, target markets, business models, or implementation strategies. Think about hybrid solutions, unconventional partnerships, emerging technologies, or novel user experiences that could enhance or replace this idea.`,
      blue: `Process for ${idea}: We should research, prototype, test, and iterate systematically. The approach should include user research, technical feasibility studies, market validation, risk assessment, and phased implementation. We need clear milestones and decision points.`
    };
    
    return analyses[hat as keyof typeof analyses] || `Analysis of ${idea} from ${hat} perspective.`;
  }