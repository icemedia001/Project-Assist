import { createTool } from "@iqai/adk";
import { z } from "zod";

export const mindMapTool = createTool({
    name: "create_mind_map",
    description: "Create a mind map to explore and expand on an idea",
    schema: z.object({
      centralIdea: z.string().describe("The central idea for the mind map"),
      branches: z.array(z.string()).optional().describe("Initial branches to explore"),
      depth: z.number().default(2).describe("How many levels deep to explore")
    }),
    fn: ({ centralIdea, branches, depth }, toolContext) => {
      const mindMap = generateMindMap(centralIdea, branches || [], depth);
      
      const currentMaps = toolContext.state.get("mind_maps", []);
      const conversationHistory = toolContext.state.get("conversation_history", []);
      
      const newMap = {
        id: Date.now(),
        centralIdea: centralIdea,
        map: mindMap,
        timestamp: new Date().toISOString()
      };
      
      toolContext.state.set("mind_maps", [...currentMaps, newMap]);
      toolContext.state.set("conversation_history", [
        ...conversationHistory,
        {
          type: "technique_application",
          technique: "Mind Mapping",
          centralIdea: centralIdea,
          branches: branches || [],
          depth: depth,
          timestamp: new Date().toISOString()
        }
      ]);
      
      return {
        centralIdea: centralIdea,
        mindMap: mindMap,
        totalMaps: currentMaps.length + 1,
        message: `Created mind map with ${Object.keys(mindMap).length} main branches`
      };
    }
  });

function generateMindMap(centralIdea: string, branches: string[], depth: number): any {
    const defaultBranches = [
      "User Experience",
      "Technology",
      "Business Model", 
      "Market",
      "Implementation",
      "Challenges"
    ];
    
    const selectedBranches = branches.length > 0 ? branches : defaultBranches;
    
    return {
      central: centralIdea,
      branches: selectedBranches.map(branch => ({
        name: branch,
        subBranches: generateSubBranches(branch, depth),
        insights: `Key considerations for ${branch} in relation to ${centralIdea}`
      })),
      connections: generateConnections(selectedBranches),
      insights: `Mind map exploring ${centralIdea} from multiple perspectives`
    };
  }

function generateSubBranches(branch: string, depth: number): string[] {
  const subBranchTemplates = {
    "User Experience": [
      "User Interface Design", "User Journey Mapping", "Accessibility & Inclusion", 
      "Feedback Mechanisms", "Onboarding Experience", "Mobile Responsiveness",
      "Performance & Speed", "Error Handling", "Help & Documentation"
    ],
    "Technology": [
      "Frontend Architecture", "Backend Services", "Database Design", 
      "API Integration", "Security & Privacy", "Scalability Planning",
      "Cloud Infrastructure", "DevOps & Deployment", "Monitoring & Analytics"
    ],
    "Business Model": [
      "Revenue Streams", "Cost Structure", "Value Proposition", 
      "Customer Segments", "Pricing Strategy", "Partnership Opportunities",
      "Market Positioning", "Competitive Advantage", "Growth Strategy"
    ],
    "Market": [
      "Target Audience Analysis", "Competitive Landscape", "Market Size & Growth", 
      "Industry Trends", "Customer Needs", "Market Entry Strategy",
      "Geographic Expansion", "Seasonal Considerations", "Regulatory Environment"
    ],
    "Implementation": [
      "Project Timeline", "Resource Requirements", "Team Structure", 
      "Development Phases", "Quality Assurance", "Testing Strategy",
      "Launch Planning", "Post-Launch Support", "Iteration & Updates"
    ],
    "Challenges": [
      "Technical Risks", "Market Risks", "Resource Constraints", 
      "Regulatory Compliance", "Competition Response", "User Adoption",
      "Scalability Issues", "Security Concerns", "Timeline Pressures"
    ]
  };
  
  const branches = subBranchTemplates[branch as keyof typeof subBranchTemplates] || [
    `${branch} - Strategic Planning`, 
    `${branch} - Execution`, 
    `${branch} - Monitoring`,
    `${branch} - Optimization`
  ];
  
  return depth > 1 ? branches : branches.slice(0, 4);
}

function generateConnections(branches: string[]): string[] {
  const connections = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      connections.push(`${branches[i]} ↔ ${branches[j]}`);
    }
  }
  return connections;
}