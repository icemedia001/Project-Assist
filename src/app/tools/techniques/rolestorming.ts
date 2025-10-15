import { createTool } from "@iqai/adk";
import { z } from "zod";

export const rolestormingTool = createTool({
  name: "apply_rolestorming",
  description: "Apply Rolestorming technique to explore ideas from different perspectives",
  schema: z.object({
    idea: z.string().describe("The idea to explore"),
    role: z.enum([
      "customer", 
      "competitor", 
      "investor", 
      "developer", 
      "designer", 
      "manager", 
      "user", 
      "critic"
    ]).describe("Which role to adopt for analysis"),
    context: z.string().optional().describe("Additional context about the idea")
  }),
  fn: ({ idea, role, context }, toolContext) => {
    const rolePerspectives = {
      customer: "How would a potential customer view this idea? What would they value most?",
      competitor: "How would competitors react to this idea? What would they do differently?",
      investor: "What would an investor want to know about this idea? What are the risks and returns?",
      developer: "What are the technical challenges and opportunities in implementing this idea?",
      designer: "How can we make this idea more user-friendly and visually appealing?",
      manager: "What are the operational and strategic considerations for this idea?",
      user: "How would end users interact with this idea? What would their experience be like?",
      critic: "What are the potential flaws, limitations, and areas for improvement?"
    };

    const perspective = rolePerspectives[role];
    const analysis = generateRolestormingAnalysis(idea, role);
    
    const currentAnalysis = toolContext.state.get("rolestorming_analysis", {});
    const conversationHistory = toolContext.state.get("conversation_history", []);
    
    currentAnalysis[role] = {
      idea: idea,
      perspective: perspective,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
    
    toolContext.state.set("rolestorming_analysis", currentAnalysis);
    toolContext.state.set("conversation_history", [
      ...conversationHistory,
      {
        type: "technique_application",
        technique: "Rolestorming",
        subTechnique: role,
        idea: idea,
        analysis: analysis,
        timestamp: new Date().toISOString()
      }
    ]);
    
    return {
      idea: idea,
      role: role,
      perspective: perspective,
      analysis: analysis,
      message: `Analyzed idea from ${role} perspective`
    };
  }
});

function generateRolestormingAnalysis(idea: string, role: string): string {
  const analyses = {
    customer: `As a customer, I would be interested in ${idea} because it could solve a real problem I face. I'd want to know: How easy is it to use? What's the value proposition? How does it compare to alternatives? What's the cost? I'd be looking for convenience, reliability, and clear benefits.`,
    competitor: `As a competitor, I'd see ${idea} as a potential threat or opportunity. I'd analyze: What's their unique value proposition? How can we differentiate? What are their weaknesses we can exploit? Should we build something similar or focus on our strengths?`,
    investor: `As an investor, I'd evaluate ${idea} based on: Market size and growth potential, competitive landscape, team capability, revenue model, scalability, and exit strategy. I'd want to see clear metrics, user traction, and a path to profitability.`,
    developer: `As a developer, I'd focus on the technical aspects of ${idea}: Architecture decisions, technology stack, scalability requirements, security considerations, integration challenges, and development timeline. I'd want to ensure the solution is robust and maintainable.`,
    designer: `As a designer, I'd focus on the user experience of ${idea}: User interface design, user journey mapping, accessibility, visual design, interaction patterns, and usability testing. I'd want to create an intuitive and engaging experience.`,
    manager: `As a manager, I'd consider the operational aspects of ${idea}: Resource allocation, timeline management, team coordination, risk mitigation, stakeholder communication, and success metrics. I'd want to ensure smooth execution and delivery.`,
    user: `As an end user, I'd want ${idea} to be simple, useful, and reliable. I'd care about: Ease of use, clear benefits, fast performance, good support, and regular updates. I'd want it to fit naturally into my workflow.`,
    critic: `As a critic, I'd identify potential issues with ${idea}: Market saturation, technical limitations, user adoption challenges, competitive threats, resource constraints, and execution risks. I'd want to see how these challenges are addressed.`
  };
  
  return analyses[role as keyof typeof analyses] || `Analysis of ${idea} from ${role} perspective.`;
}
