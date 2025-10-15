import { createTool } from '@iqai/adk';
import { z } from 'zod';

/**
 * Facilitation-Based Brainstorming Tools
 * These tools facilitate user creativity rather than generating ideas for them
 */

// ============================================================================
// CREATIVE EXPANSION TECHNIQUES
// ============================================================================

export const whatIfScenariosFacilitationTool = createTool({
  name: "facilitate_what_if_scenarios",
  description: "Facilitate What If Scenarios technique by asking provocative questions to expand user thinking",
  schema: z.object({
    idea: z.string().describe("The original idea to explore"),
    scenario: z.enum([
      "unlimited_resources",
      "impossible_constraints", 
      "different_era",
      "opposite_audience",
      "extreme_scale",
      "no_technology",
      "everyone_opposes",
      "must_succeed"
    ]).describe("Type of scenario to explore"),
    step: z.number().min(1).max(3).describe("Current step in the technique (1-3)")
  }),
  fn: async ({ idea, scenario, step }, context) => {
    const scenarios = {
      unlimited_resources: "What if you had unlimited time, money, and resources? How would you approach this differently?",
      impossible_constraints: "What if you could only use materials that cost less than $1? How would you solve this?",
      different_era: "What if you were solving this problem in 1950? Or 2050? How would the approach change?",
      opposite_audience: "What if your target audience was completely opposite to who you originally thought?",
      extreme_scale: "What if this had to work for 1 billion people? Or just 10 people?",
      no_technology: "What if you couldn't use any technology? How would you solve this problem?",
      everyone_opposes: "What if everyone was against your idea? How would you still make it work?",
      must_succeed: "What if failure wasn't an option and you had to succeed? What would you do differently?"
    };

    const question = scenarios[scenario];
    
    const facilitation = context.state.get("facilitation", {
      currentTechnique: "what_if_scenarios",
      step: 1,
      waitingForResponse: true,
      userResponses: [],
      engagementLevel: "medium"
    });
    
    facilitation.currentTechnique = "what_if_scenarios";
    facilitation.step = step;
    facilitation.waitingForResponse = true;
    facilitation.currentQuestion = question;
    facilitation.scenario = scenario;
    
    context.state.set("facilitation", facilitation);
    
    try {
      await context.saveArtifact(
        `what_if_scenario_${scenario}_step_${step}_${Date.now()}.json`,
        { 
          text: JSON.stringify({
            technique: "What If Scenarios",
            scenario: scenario,
            step: step,
            question: question,
            originalIdea: idea,
            timestamp: new Date().toISOString()
          }, null, 2) 
        }
      );
    } catch (error) {
      console.warn("Failed to save technique progress as artifact:", error);
    }
    
    return {
      technique: "What If Scenarios",
      step: step,
      question: question,
      scenario: scenario,
      nextStep: step < 3 ? "Ask the user this question and wait for their response" : "Complete the technique and move to next",
      message: `What If Scenario ${step}/3: ${question}`,
      waitForUserResponse: true
    };
  }
});

export const analogicalThinkingFacilitationTool = createTool({
  name: "facilitate_analogical_thinking",
  description: "Facilitate Analogical Thinking by providing examples and asking user to find connections",
  schema: z.object({
    idea: z.string().describe("The original idea to explore"),
    analogyType: z.enum([
      "nature",
      "sports",
      "cooking",
      "architecture",
      "music",
      "gardening",
      "transportation",
      "education"
    ]).describe("Type of analogy to explore"),
    step: z.number().min(1).max(3).describe("Current step in the technique (1-3)")
  }),
  fn: async ({ idea, analogyType, step }, context) => {
    const analogies = {
      nature: "How does nature solve similar problems? Think about ecosystems, evolution, or natural processes.",
      sports: "How do sports teams or athletes approach similar challenges? What strategies do they use?",
      cooking: "How would a chef approach this problem? What ingredients, techniques, or processes apply?",
      architecture: "How would an architect design a solution? What structural principles apply?",
      music: "How do musicians create harmony from different elements? What musical concepts apply?",
      gardening: "How does a gardener nurture growth? What cultivation principles apply?",
      transportation: "How do different transportation systems solve similar problems? What logistics apply?",
      education: "How do teachers help people learn complex concepts? What pedagogical approaches apply?"
    };

    const prompt = analogies[analogyType];
    
    const facilitation = context.state.get("facilitation", {
      currentTechnique: "analogical_thinking",
      step: 1,
      waitingForResponse: true,
      userResponses: [],
      engagementLevel: "medium"
    });
    
    facilitation.currentTechnique = "analogical_thinking";
    facilitation.step = step;
    facilitation.waitingForResponse = true;
    facilitation.currentQuestion = prompt;
    facilitation.analogyType = analogyType;
    
    context.state.set("facilitation", facilitation);
    
    try {
      await context.saveArtifact(
        `analogical_thinking_${analogyType}_step_${step}_${Date.now()}.json`,
        { 
          text: JSON.stringify({
            technique: "Analogical Thinking",
            analogyType: analogyType,
            step: step,
            prompt: prompt,
            originalIdea: idea,
            timestamp: new Date().toISOString()
          }, null, 2) 
        }
      );
    } catch (error) {
      console.warn("Failed to save technique progress as artifact:", error);
    }
    
    return {
      technique: "Analogical Thinking",
      step: step,
      prompt: prompt,
      analogyType: analogyType,
      nextStep: step < 3 ? "Ask the user to find 2-3 specific connections" : "Complete the technique and move to next",
      message: `Analogical Thinking ${step}/3: ${prompt}`,
      waitForUserResponse: true
    };
  }
});

// ============================================================================
// COLLABORATIVE TECHNIQUES
// ============================================================================

export const yesAndBuildingFacilitationTool = createTool({
  name: "facilitate_yes_and_building",
  description: "Facilitate Yes, And... Building by alternating between user and agent building on ideas",
  schema: z.object({
    idea: z.string().describe("The current idea to build upon"),
    buildType: z.enum([
      "add_feature",
      "expand_audience",
      "add_context",
      "combine_with_other",
      "add_emotion",
      "add_constraint",
      "add_benefit",
      "add_metaphor"
    ]).describe("How to build on the idea"),
    turn: z.enum(["user", "agent"]).describe("Whose turn it is to build")
  }),
  fn: async ({ idea, buildType, turn }, context) => {
    const buildPrompts = {
      add_feature: "Yes, and what if we added [specific feature]? How would that enhance the idea?",
      expand_audience: "Yes, and what if we expanded this to also serve [different audience]?",
      add_context: "Yes, and what if this happened in [different context/environment]?",
      combine_with_other: "Yes, and what if we combined this with [another concept/idea]?",
      add_emotion: "Yes, and what if this created a feeling of [specific emotion] in users?",
      add_constraint: "Yes, and what if we had to work within [specific constraint]?",
      add_benefit: "Yes, and what if this also provided [additional benefit]?",
      add_metaphor: "Yes, and what if we thought of this as [metaphor/analogy]?"
    };

    const buildPrompt = buildPrompts[buildType];
    
    const facilitation = context.state.get("facilitation", {
      currentTechnique: "yes_and_building",
      step: 1,
      waitingForResponse: true,
      userResponses: [],
      engagementLevel: "medium",
      yesAndChain: []
    });
    
    facilitation.currentTechnique = "yes_and_building";
    facilitation.waitingForResponse = turn === "user";
    facilitation.currentQuestion = buildPrompt;
    facilitation.buildType = buildType;
    facilitation.turn = turn;
    
    if (!facilitation.yesAndChain) facilitation.yesAndChain = [];
    facilitation.yesAndChain.push({
      idea: idea,
      buildType: buildType,
      turn: turn,
      timestamp: new Date().toISOString()
    });
    
    context.state.set("facilitation", facilitation);
    
    try {
      await context.saveArtifact(
        `yes_and_building_${buildType}_${turn}_${Date.now()}.json`,
        { 
          text: JSON.stringify({
            technique: "Yes, And Building",
            buildType: buildType,
            turn: turn,
            buildPrompt: buildPrompt,
            originalIdea: idea,
            chainLength: facilitation.yesAndChain.length,
            timestamp: new Date().toISOString()
          }, null, 2) 
        }
      );
    } catch (error) {
      console.warn("Failed to save technique progress as artifact:", error);
    }
    
    return {
      technique: "Yes, And Building",
      turn: turn,
      buildPrompt: buildPrompt,
      buildType: buildType,
      chainLength: facilitation.yesAndChain.length,
      nextStep: turn === "user" ? "Wait for user to build on the idea" : "Agent builds on the idea",
      message: turn === "user" ? `Your turn! ${buildPrompt}` : `Agent builds: ${buildPrompt}`,
      waitForUserResponse: turn === "user"
    };
  }
});

// ============================================================================
// DEEP EXPLORATION TECHNIQUES
// ============================================================================

export const fiveWhysFacilitationTool = createTool({
  name: "facilitate_five_whys",
  description: "Facilitate Five Whys technique by asking one 'Why' question at a time",
  schema: z.object({
    idea: z.string().describe("The original idea or problem to explore"),
    whyLevel: z.number().min(1).max(5).describe("Which 'Why' level we're on (1-5)"),
    previousAnswer: z.string().optional().describe("The answer to the previous 'Why' question")
  }),
  fn: async ({ idea, whyLevel, previousAnswer }, context) => {
    const whyQuestions = {
      1: `Why is "${idea}" important or needed?`,
      2: `Why does that matter? (Building on: "${previousAnswer || idea}")`,
      3: `Why is that the case? (Building on: "${previousAnswer || idea}")`,
      4: `Why does that happen? (Building on: "${previousAnswer || idea}")`,
      5: `Why is that the root cause? (Building on: "${previousAnswer || idea}")`
    };

    const whyQuestion = whyQuestions[whyLevel as keyof typeof whyQuestions];
    
    const facilitation = context.state.get("facilitation", {
      currentTechnique: "five_whys",
      step: 1,
      waitingForResponse: true,
      userResponses: [],
      engagementLevel: "medium",
      fiveWhysChain: []
    });
    
    facilitation.currentTechnique = "five_whys";
    facilitation.step = whyLevel;
    facilitation.waitingForResponse = true;
    facilitation.currentQuestion = whyQuestion;
    facilitation.whyLevel = whyLevel;
    
    if (!facilitation.fiveWhysChain) facilitation.fiveWhysChain = [];
    facilitation.fiveWhysChain.push({
      level: whyLevel,
      question: whyQuestion,
      previousAnswer: previousAnswer,
      timestamp: new Date().toISOString()
    });
    
    context.state.set("facilitation", facilitation);
    
    try {
      await context.saveArtifact(
        `five_whys_level_${whyLevel}_${Date.now()}.json`,
        { 
          text: JSON.stringify({
            technique: "Five Whys",
            level: whyLevel,
            question: whyQuestion,
            previousAnswer: previousAnswer,
            originalIdea: idea,
            chainLength: facilitation.fiveWhysChain.length,
            timestamp: new Date().toISOString()
          }, null, 2) 
        }
      );
    } catch (error) {
      console.warn("Failed to save technique progress as artifact:", error);
    }
    
    const isLastLevel = whyLevel === 5;
    
    return {
      technique: "Five Whys",
      level: whyLevel,
      question: whyQuestion,
      isLastLevel: isLastLevel,
      chainLength: facilitation.fiveWhysChain.length,
      nextStep: isLastLevel 
        ? "Complete the technique - you've reached the root cause!"
        : "Ask the user this 'Why' question and wait for their answer",
      message: `Five Whys Level ${whyLevel}/5: ${whyQuestion}`,
      waitForUserResponse: true
    };
  }
});

// ============================================================================
// TECHNIQUE SELECTION AND PROGRESS
// ============================================================================

export const selectTechniquesFacilitationTool = createTool({
  name: "select_brainstorming_techniques",
  description: "Select brainstorming techniques for the session",
  schema: z.object({
    userInput: z.string().describe("User's technique selection (e.g., '1,4' or 'scamper,rolestorming')")
  }),
  fn: async ({ userInput }, context) => {
    const raw = userInput.trim().toLowerCase();
    const techniqueMap = {
      "1": "what_if_scenarios", "what_if_scenarios": "what_if_scenarios",
      "2": "analogical_thinking", "analogical_thinking": "analogical_thinking", 
      "3": "reversal_inversion", "reversal_inversion": "reversal_inversion",
      "4": "first_principles", "first_principles": "first_principles",
      
      "5": "scamper", "scamper": "scamper",
      "6": "six_hats", "six_hats": "six_hats",
      "7": "mind_map", "mind_map": "mind_map",
      
      "8": "yes_and_building", "yes_and_building": "yes_and_building",
      "9": "brainwriting", "brainwriting": "brainwriting",
      "10": "random_stimulation", "random_stimulation": "random_stimulation",
      
      "11": "five_whys", "five_whys": "five_whys",
      "12": "morphological_analysis", "morphological_analysis": "morphological_analysis",
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
      what_if_scenarios: { name: "What If Scenarios", description: "Provocative questions to expand thinking" },
      analogical_thinking: { name: "Analogical Thinking", description: "Find connections through analogies" },
      reversal_inversion: { name: "Reversal/Inversion", description: "Flip the problem to find new angles" },
      first_principles: { name: "First Principles Thinking", description: "Break down to fundamentals" },
      
      scamper: { name: "SCAMPER Method", description: "7 perspectives for modification" },
      six_hats: { name: "Six Thinking Hats", description: "6 different viewpoints" },
      mind_map: { name: "Mind Mapping", description: "Visual organization and expansion" },
      
      yes_and_building: { name: "Yes, And... Building", description: "Build ideas collaboratively" },
      brainwriting: { name: "Brainwriting/Round Robin", description: "Pass ideas back and forth" },
      random_stimulation: { name: "Random Stimulation", description: "Use random prompts for connections" },
      
      five_whys: { name: "Five Whys", description: "Drill down to root causes" },
      morphological_analysis: { name: "Morphological Analysis", description: "Explore parameter combinations" },
      provocation: { name: "Provocation Technique (PO)", description: "Challenge with provocative statements" },
      
      forced_relationships: { name: "Forced Relationships", description: "Connect unrelated concepts" },
      assumption_reversal: { name: "Assumption Reversal", description: "Challenge core assumptions" },
      role_playing: { name: "Role Playing", description: "Different stakeholder perspectives" },
      time_shifting: { name: "Time Shifting", description: "Solve in different time periods" },
      resource_constraints: { name: "Resource Constraints", description: "Limited resources, unlimited creativity" },
      metaphor_mapping: { name: "Metaphor Mapping", description: "Extended metaphors for solutions" },
      question_storming: { name: "Question Storming", description: "Generate questions before answers" }
    };

    if (raw === "1" || raw === "list" || raw === "option:1") {
      return {
        awaitingSelection: true,
        message: "Please select techniques by number (comma-separated), e.g., '6,8,10'. Available: 1 What If, 2 Analogical, 3 Reversal, 4 First Principles, 5 SCAMPER, 6 Six Hats, 7 Mind Map, 8 Yes, And, 9 Brainwriting, 10 Random Stimulation, 11 Five Whys, 12 Morphological, 13 Provocation, 14 Forced Relationships, 15 Assumption Reversal, 16 Role Playing, 17 Time Shifting, 18 Resource Constraints, 19 Metaphor Mapping, 20 Question Storming",
      } as const;
    }

    if (raw === "2" || raw === "recommend" || raw === "option:2") {
      const recommended = ["what_if_scenarios", "scamper", "five_whys"] as Array<keyof typeof techniqueInfo>;
      const facilitationState = context.state.get("facilitation", {} as any);
      facilitationState.selectedTechniques = recommended;
      facilitationState.currentTechniqueIndex = 0;
      facilitationState.sessionStartTime = new Date().toISOString();
      context.state.set("facilitation", facilitationState);
      return {
        success: true,
        selectedTechniques: recommended,
        techniqueInfo: recommended.map(t => techniqueInfo[t]),
        totalTechniques: recommended.length,
        message: `Recommended techniques selected: ${recommended.map(t => techniqueInfo[t].name).join(", ")}. Let's start with ${techniqueInfo[recommended[0]].name}.`,
        nextStep: "Begin the first technique"
      };
    }

    if (raw === "3" || raw === "random" || raw === "option:3") {
      const pool = Object.keys(techniqueInfo) as Array<keyof typeof techniqueInfo>;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const randomSet = shuffled.slice(0, 3);
      const facilitationState = context.state.get("facilitation", {} as any);
      facilitationState.selectedTechniques = randomSet;
      facilitationState.currentTechniqueIndex = 0;
      facilitationState.sessionStartTime = new Date().toISOString();
      context.state.set("facilitation", facilitationState);
      return {
        success: true,
        selectedTechniques: randomSet,
        techniqueInfo: randomSet.map(t => techniqueInfo[t]),
        totalTechniques: randomSet.length,
        message: `Random techniques selected: ${randomSet.map(t => techniqueInfo[t].name).join(", ")}. Let's start with ${techniqueInfo[randomSet[0]].name}.`,
        nextStep: "Begin the first technique"
      };
    }

    if (raw === "4" || raw === "progressive" || raw === "option:4") {
      const progressive = [
        "what_if_scenarios",
        "random_stimulation",
        "mind_map",
        "five_whys",
        "morphological_analysis",
        "scamper",
        "assumption_reversal",
      ] as Array<keyof typeof techniqueInfo>;
      const facilitationState = context.state.get("facilitation", {} as any);
      facilitationState.selectedTechniques = progressive;
      facilitationState.currentTechniqueIndex = 0;
      facilitationState.sessionStartTime = new Date().toISOString();
      context.state.set("facilitation", facilitationState);
      return {
        success: true,
        selectedTechniques: progressive,
        techniqueInfo: progressive.map(t => techniqueInfo[t]),
        totalTechniques: progressive.length,
        message: `Progressive flow selected (broad → narrow): ${progressive.map(t => techniqueInfo[t].name).join(" → ")}. Let's start with ${techniqueInfo[progressive[0]].name}.`,
        nextStep: "Begin the first technique"
      };
    }

    const selections = userInput.split(/[,\s]+/).map(s => s.trim().toLowerCase());
    const techniques = selections
      .map(s => techniqueMap[s as keyof typeof techniqueMap])
      .filter(Boolean) as Array<keyof typeof techniqueInfo>;

    if (techniques.length === 0) {
      return {
        error: "Could not parse technique selection. Please use numbers (1-20) or technique names.",
        userInput,
        message: "Please select techniques using numbers (1-20) or technique names. Available: what_if_scenarios, analogical_thinking, reversal_inversion, first_principles, scamper, six_hats, mind_map, yes_and_building, brainwriting, random_stimulation, five_whys, morphological_analysis, provocation, forced_relationships, assumption_reversal, role_playing, time_shifting, resource_constraints, metaphor_mapping, question_storming"
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

    return {
      success: true,
      selectedTechniques: techniques,
      techniqueInfo: techniques.map(t => techniqueInfo[t]),
      totalTechniques: techniques.length,
      message: `Great! Selected ${techniques.length} technique(s). Let's start with ${techniqueInfo[techniques[0]].name}.`,
      nextStep: "Begin the first technique"
    };
  }
});

export const facilitationTools = () => [
  whatIfScenariosFacilitationTool,
  analogicalThinkingFacilitationTool,
  yesAndBuildingFacilitationTool,
  fiveWhysFacilitationTool,
  selectTechniquesFacilitationTool
];
