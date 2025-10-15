import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const selectTechniquesTool = createTool({
  name: "select_brainstorming_techniques",
  description: "Process user's technique selection (like '6,8,10') and return the selected brainstorming techniques. Use this when user provides numbers separated by commas.",
  schema: z.object({
    userInput: z.string().optional().describe("User's technique selection (e.g., '1,4' or 'scamper,rolestorming'). If empty, presents the technique list.")
  }),
  fn: async ({ userInput }, context) => {
    console.log("🔧 select_brainstorming_techniques called with input:", userInput);
    
    if (!userInput || userInput.trim() === "") {
      return {
        error: "No technique selection provided. Please select techniques using the UI.",
        message: "Please select brainstorming techniques using the technique selector interface."
      };
    }
    const techniqueMap = {
      "1": "what_if", "what_if": "what_if",
      "2": "analogical", "analogical": "analogical", 
      "3": "reversal", "reversal": "reversal",
      "4": "first_principles", "first_principles": "first_principles",
      
      "5": "scamper", "scamper": "scamper",
      "6": "six_hats", "six_hats": "six_hats",
      "7": "mind_map", "mind_map": "mind_map",
      
      "8": "yes_and", "yes_and": "yes_and",
      "9": "brainwriting", "brainwriting": "brainwriting",
      "10": "random_stimulation", "random_stimulation": "random_stimulation",
      
      "11": "five_whys", "five_whys": "five_whys",
      "12": "morphological", "morphological": "morphological",
      "13": "provocation", "provocation": "provocation",
      
      "14": "forced_relationships", "forced_relationships": "forced_relationships",
      "15": "assumption_reversal", "assumption_reversal": "assumption_reversal",
      "16": "role_playing", "role_playing": "role_playing",
      "17": "time_shifting", "time_shifting": "time_shifting",
      "18": "resource_constraints", "resource_constraints": "resource_constraints",
      "19": "metaphor_mapping", "metaphor_mapping": "metaphor_mapping",
      "20": "question_storming", "question_storming": "question_storming"
    };

    const techniqueInfo = {
      what_if: { name: "What If Scenarios", description: "Provocative questions to expand thinking" },
      analogical: { name: "Analogical Thinking", description: "Find connections through analogies" },
      reversal: { name: "Reversal/Inversion", description: "Flip the problem to find new angles" },
      first_principles: { name: "First Principles Thinking", description: "Break down to fundamentals" },
      
      scamper: { name: "SCAMPER Method", description: "7 perspectives for modification" },
      six_hats: { name: "Six Thinking Hats", description: "6 different viewpoints" },
      mind_map: { name: "Mind Mapping", description: "Visual organization and expansion" },
      
      yes_and: { name: "Yes, And... Building", description: "Build ideas collaboratively" },
      brainwriting: { name: "Brainwriting/Round Robin", description: "Pass ideas back and forth" },
      random_stimulation: { name: "Random Stimulation", description: "Use random prompts for connections" },
      
      five_whys: { name: "Five Whys", description: "Drill down to root causes" },
      morphological: { name: "Morphological Analysis", description: "Explore parameter combinations" },
      provocation: { name: "Provocation Technique (PO)", description: "Challenge with provocative statements" },
      
      forced_relationships: { name: "Forced Relationships", description: "Connect unrelated concepts" },
      assumption_reversal: { name: "Assumption Reversal", description: "Challenge core assumptions" },
      role_playing: { name: "Role Playing", description: "Different stakeholder perspectives" },
      time_shifting: { name: "Time Shifting", description: "Solve in different time periods" },
      resource_constraints: { name: "Resource Constraints", description: "Limited resources, unlimited creativity" },
      metaphor_mapping: { name: "Metaphor Mapping", description: "Extended metaphors for solutions" },
      question_storming: { name: "Question Storming", description: "Generate questions before answers" }
    };

    const selections = userInput.split(/[,\s]+/).map(s => s.trim().toLowerCase());
    const techniques = selections
      .map(s => techniqueMap[s as keyof typeof techniqueMap])
      .filter(Boolean) as Array<keyof typeof techniqueInfo>;

    if (techniques.length === 0) {
      return {
        error: "Could not parse technique selection. Please use numbers (1-20) or technique names.",
        userInput,
        message: "Please select techniques using numbers (1-20) or technique names. Available: what_if, analogical, reversal, first_principles, scamper, six_hats, mind_map, yes_and, brainwriting, random_stimulation, five_whys, morphological, provocation, forced_relationships, assumption_reversal, role_playing, time_shifting, resource_constraints, metaphor_mapping, question_storming"
      };
    }

    const facilitation = context.state.get("facilitation", {
      currentTechnique: null,
      step: 0,
      waitingForResponse: false,
      userResponses: [],
      engagementLevel: "medium"
    });
    
    facilitation.selectedTechniques = techniques;
    facilitation.currentTechniqueIndex = 0;
    facilitation.sessionStartTime = new Date().toISOString();
    
    context.state.set("facilitation", facilitation);

    try {
      await context.saveArtifact(
        `technique_selection_${Date.now()}.json`,
        { 
          text: JSON.stringify({
            selectedTechniques: techniques,
            techniqueInfo: techniques.map(t => techniqueInfo[t]),
            timestamp: new Date().toISOString(),
            userInput
          }, null, 2)
        }
      );
    } catch (error) {
      console.warn("Failed to save technique selection as artifact:", error);
    }
    
    const result = {
      selectedTechniques: techniques.map(t => techniqueInfo[t]),
      totalSelected: techniques.length,
      nextTechnique: techniqueInfo[techniques[0]],
      message: `Great! I'll help you explore your idea using ${techniques.map(t => techniqueInfo[t].name).join(' and ')}. Let's start with ${techniqueInfo[techniques[0]].name}.`,
      sessionPhase: "technique_selection",
      timestamp: new Date().toISOString()
    };
    
    console.log("🔧 select_brainstorming_techniques returning:", result);
    return result;
  }
});
