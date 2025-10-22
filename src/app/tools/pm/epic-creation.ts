import { createTool } from "@iqai/adk";
import { z } from "zod";

export const createEpicTool = createTool({
  name: "create_epic",
  description: "Create a product epic with user stories and acceptance criteria",
  schema: z.object({
    epicData: z.object({
      title: z.string().describe("Epic title"),
      description: z.string().describe("Epic description"),
      businessValue: z.string().describe("Business value and rationale"),
      userPersona: z.string().describe("Target user persona"),
      priority: z.enum(["high", "medium", "low"]).default("medium").describe("Epic priority"),
      estimatedEffort: z.enum(["small", "medium", "large", "xlarge"]).optional().describe("Estimated effort level")
    }).describe("Epic definition data"),
    features: z.array(z.object({
      title: z.string(),
      description: z.string(),
      userBenefit: z.string().optional()
    })).describe("Features to include in the epic"),
    projectType: z.enum(["greenfield", "brownfield"]).default("greenfield").describe("Project type")
  }),
  fn: ({ epicData, features, projectType }, context) => {
    const epic = generateEpicContent(epicData, features, projectType);
    const userStories = generateUserStories(features, epicData.userPersona);
    
    return {
      epic: epic,
      userStories: userStories,
      epicSummary: {
        title: epicData.title,
        priority: epicData.priority,
        estimatedEffort: epicData.estimatedEffort || "medium",
        storyCount: userStories.length,
        businessValue: epicData.businessValue
      },
      message: `Successfully created epic "${epicData.title}" with ${userStories.length} user stories`
    };
  }
});

function generateEpicContent(epicData: any, features: any[], projectType: string): string {
  const timestamp = new Date().toISOString();
  
  let epic = `# Epic: ${epicData.title}\n\n`;
  epic += `**Created:** ${timestamp}\n`;
  epic += `**Project Type:** ${projectType}\n`;
  epic += `**Priority:** ${epicData.priority.toUpperCase()}\n`;
  epic += `**Estimated Effort:** ${epicData.estimatedEffort || "Medium"}\n\n`;
  
  epic += `---\n\n`;
  
  epic += `## Epic Overview\n\n`;
  epic += `**Description:** ${epicData.description}\n\n`;
  epic += `**Business Value:** ${epicData.businessValue}\n\n`;
  epic += `**Target User:** ${epicData.userPersona}\n\n`;
  
  epic += `## Success Criteria\n\n`;
  epic += `This epic will be considered complete when:\n`;
  epic += `- [ ] All user stories are implemented and tested\n`;
  epic += `- [ ] User acceptance criteria are met\n`;
  epic += `- [ ] Performance requirements are satisfied\n`;
  epic += `- [ ] Security and accessibility standards are met\n`;
  epic += `- [ ] Documentation is complete and up-to-date\n\n`;
  
  epic += `## Features Included\n\n`;
  features.forEach((feature, index) => {
    epic += `### ${index + 1}. ${feature.title}\n`;
    epic += `${feature.description}\n\n`;
    if (feature.userBenefit) {
      epic += `**User Benefit:** ${feature.userBenefit}\n\n`;
    }
  });
  
  epic += `## Dependencies\n\n`;
  if (projectType === "brownfield") {
    epic += `- Integration with existing system architecture\n`;
    epic += `- Data migration and compatibility considerations\n`;
    epic += `- Testing against current production environment\n`;
  } else {
    epic += `- Initial project setup and infrastructure\n`;
    epic += `- Core platform and framework establishment\n`;
    epic += `- Development environment configuration\n`;
  }
  epic += `\n`;
  
  epic += `## Technical Considerations\n\n`;
  epic += `- **Architecture:** Follow established patterns and conventions\n`;
  epic += `- **Testing:** Unit, integration, and end-to-end tests required\n`;
  epic += `- **Performance:** Meet defined performance benchmarks\n`;
  epic += `- **Security:** Implement security best practices\n`;
  epic += `- **Documentation:** Maintain comprehensive documentation\n\n`;
  
  epic += `## Risk Assessment\n\n`;
  epic += `### High Risk\n`;
  epic += `- Complex integrations or dependencies\n`;
  epic += `- Performance requirements under load\n\n`;
  
  epic += `### Medium Risk\n`;
  epic += `- User experience complexity\n`;
  epic += `- Data consistency and integrity\n\n`;
  
  epic += `### Low Risk\n`;
  epic += `- Standard feature implementation\n`;
  epic += `- Well-defined requirements\n\n`;
  
  epic += `## Definition of Done\n\n`;
  epic += `Each user story in this epic must meet the following criteria:\n`;
  epic += `- [ ] Code is written and reviewed\n`;
  epic += `- [ ] Unit tests pass with adequate coverage\n`;
  epic += `- [ ] Integration tests pass\n`;
  epic += `- [ ] User acceptance criteria are verified\n`;
  epic += `- [ ] Performance requirements are met\n`;
  epic += `- [ ] Security review is completed\n`;
  epic += `- [ ] Documentation is updated\n`;
  epic += `- [ ] Feature is deployed to staging environment\n`;
  epic += `- [ ] Stakeholder approval is obtained\n\n`;
  
  epic += `---\n\n`;
  epic += `*Epic created by Project Assist*\n`;
  
  return epic;
}

function generateUserStories(features: any[], userPersona: string): any[] {
  return features.map((feature, index) => ({
    id: `US-${index + 1}`,
    title: feature.title,
    description: `As a ${userPersona}, I want ${feature.title.toLowerCase()} so that I can ${feature.userBenefit || "achieve my goals"}.`,
    acceptanceCriteria: [
      `${feature.title} functions as described`,
      `User can successfully complete the primary workflow`,
      `Feature meets performance requirements`,
      `Feature is accessible and usable`
    ],
    priority: "medium",
    estimatedEffort: "medium"
  }));
}
