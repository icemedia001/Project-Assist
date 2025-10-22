import { scamperTool } from './techniques/scamper';
import { sixHatsTool } from './techniques/six-hats';
import { mindMapTool } from './techniques/mind-mapping';
import { rolestormingTool } from './techniques/rolestorming';
import { facilitationTools } from './techniques/facilitation-tools';
import { clusterIdeasTool } from './analysis/clustering';
import { scoreIdeasTool } from './analysis/scoring';
import { ideaManagementTools } from './analysis/idea-manager';
import { generateDiscoveryReportTool } from './output/report-generation';
import { techStackTool } from './architecture/tech-stack';
import { architectureDesignTool } from './architecture/architecture-design';
import { riskAssessmentTool } from './validation/risk-assessment';
import { feasibilityCheckTool } from './validation/feasibility-check';
import { selectTechniquesTool } from './brainstorming/technique-selector';
import { completeTechniqueTool } from './brainstorming/technique-progress';
import { workflowTools } from './workflow/flow-processor';
import { generatePrdTool, createEpicTool, validatePrdTool } from './pm';

export const techniqueTools = () => [
  scamperTool,
  sixHatsTool,
  mindMapTool,
  rolestormingTool,
  ...facilitationTools()
];

export const analysisTools = () => [
  clusterIdeasTool,
  scoreIdeasTool
];

export const outputTools = () => [
  generateDiscoveryReportTool
];

export const architectureTools = () => [
  techStackTool,
  architectureDesignTool
];

export const validationTools = () => [
  riskAssessmentTool,
  feasibilityCheckTool
];

export const allTools = () => [
  ...techniqueTools(),
  ...analysisTools(),
  ...outputTools(),
  ...architectureTools(),
  ...validationTools()
];

export const brainAgentTools = () => [
  ...techniqueTools(),
  selectTechniquesTool,
  completeTechniqueTool,
  ...ideaManagementTools()
];

export const analystAgentTools = () => [clusterIdeasTool];

export const pmAgentTools = () => [
  scoreIdeasTool,
  clusterIdeasTool,
  ...pmTools()
];

export const architectAgentTools = () => [
  ...architectureTools()
];

export const validatorAgentTools = () => [
  ...validationTools()
];

export const pmTools = () => [
  generatePrdTool,
  createEpicTool,
  validatePrdTool
];

export const coordinatorTools = () => [
  generateDiscoveryReportTool,
  ...workflowTools()
];

export { scamperTool } from './techniques/scamper';
export { sixHatsTool } from './techniques/six-hats';
export { mindMapTool } from './techniques/mind-mapping';
export { rolestormingTool } from './techniques/rolestorming';
export { facilitationTools } from './techniques/facilitation-tools';
export { clusterIdeasTool } from './analysis/clustering';
export { scoreIdeasTool } from './analysis/scoring';
export { ideaManagementTools } from './analysis/idea-manager';
export { generateDiscoveryReportTool } from './output/report-generation';
export { techStackTool } from './architecture/tech-stack';
export { architectureDesignTool } from './architecture/architecture-design';
export { riskAssessmentTool } from './validation/risk-assessment';
export { feasibilityCheckTool } from './validation/feasibility-check';
export { selectTechniquesTool } from './brainstorming/technique-selector';
export { completeTechniqueTool } from './brainstorming/technique-progress';
export { workflowTools } from './workflow/flow-processor';
export { generatePrdTool, createEpicTool, validatePrdTool } from './pm';
