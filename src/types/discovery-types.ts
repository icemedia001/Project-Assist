export type DiscoveryPhase = 
  | "problem_analysis"
  | "brainstorming"
  | "prioritization"
  | "architecture"
  | "validation"
  | "completed";

export type SessionStatus = "active" | "completed" | "paused" | "failed";

export type PriorityLevel = "critical" | "important" | "nice-to-have";

export type RiskType = "technical" | "market" | "resource" | "timeline" | "security" | "compliance";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type ScoreRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface DiscoverySession {
  readonly id: string;
  readonly userId: string;
  readonly agentSessionId: string;
  title: string | null;
  problemStatement?: string | null;
  status: SessionStatus;
  currentPhase: DiscoveryPhase;
  readonly createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  metadata?: SessionMetadata;
  errorDetails?: SessionError;
}

export interface SessionMetadata {
  version: string;
  userAgent?: string;
  ipAddress?: string;
  timezone?: string;
  language?: string;
  customFields?: Record<string, unknown>;
}

export interface SessionError {
  code: string;
  message: string;
  phase: DiscoveryPhase;
  timestamp: Date;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

export interface ProblemAnalysis {
  problemStatement: string;
  targetAudience: string;
  constraints: readonly string[];
  successCriteria: readonly string[];
  marketContext?: string;
  competitiveLandscape?: string;
  businessObjectives?: readonly string[];
  assumptions?: readonly string[];
  validatedAt?: Date;
}

export interface BrainstormingResult {
  readonly id: string;
  technique: string;
  ideas: readonly Idea[];
  insights: readonly string[];
  patterns: readonly string[];
  sessionNotes: string;
  duration: number;
  participantCount?: number;
  createdAt: Date;
  effectiveness?: number;
}

export interface Idea {
  readonly id: string;
  title: string;
  description: string;
  rationale: string;
  category: string;
  tags: readonly string[];
  source?: string;
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrioritizationResult {
  scoredIdeas: readonly ScoredIdea[];
  clusters: readonly IdeaCluster[];
  recommendations: readonly string[];
  nextSteps: readonly string[];
  mvpScope: readonly string[];
  scoringMethodology: string;
  totalIdeas: number;
  processedAt: Date;
}

export interface ScoredIdea extends Idea {
  impact: ScoreRange;
  feasibility: ScoreRange;
  effort: ScoreRange;
  priority: number;
  riskLevel: RiskSeverity;
  dependencies?: readonly string[];
  blockers?: readonly string[];
}

export interface IdeaCluster {
  readonly id: string;
  name: string;
  description: string;
  ideas: readonly string[];
  theme: string;
  strength: number;
  representativeIdea?: string;
}

export interface ArchitecturePlan {
  techStack: TechStack;
  architecture: string;
  integrations: readonly string[];
  teamRequirements: readonly TeamRequirement[];
  developmentPhases: readonly DevelopmentPhase[];
  risks: readonly Risk[];
  scalability: ScalabilityPlan;
  security: SecurityPlan;
  compliance: CompliancePlan;
  estimatedCost?: CostEstimate;
  createdAt: Date;
  reviewedBy?: string[];
}

export interface TechStack {
  frontend: readonly TechChoice[];
  backend: readonly TechChoice[];
  database: TechChoice;
  infrastructure: readonly TechChoice[];
  apis: readonly TechChoice[];
  monitoring: readonly TechChoice[];
  testing: readonly TechChoice[];
}

export interface TechChoice {
  name: string;
  version?: string;
  rationale: string;
  alternatives?: readonly string[];
  maturity: "experimental" | "beta" | "stable" | "deprecated";
  license?: string;
}

export interface TeamRequirement {
  readonly id: string;
  role: string;
  skills: readonly string[];
  experience: string;
  priority: PriorityLevel;
  estimatedHours?: number;
  startDate?: Date;
  endDate?: Date;
  dependencies?: readonly string[];
}

export interface DevelopmentPhase {
  readonly id: string;
  name: string;
  description: string;
  duration: string;
  deliverables: readonly string[];
  dependencies: readonly string[];
  milestones: readonly Milestone[];
  resources: readonly ResourceRequirement[];
  startDate?: Date;
  endDate?: Date;
}

export interface Milestone {
  readonly id: string;
  name: string;
  description: string;
  dueDate?: Date;
  completedAt?: Date;
  status: "pending" | "in-progress" | "completed" | "blocked";
  dependencies?: readonly string[];
}

export interface ResourceRequirement {
  type: "human" | "infrastructure" | "software" | "hardware";
  description: string;
  quantity: number;
  cost?: number;
  duration?: string;
}

export interface ValidationResult {
  coherence: boolean;
  risks: readonly Risk[];
  gaps: readonly string[];
  recommendations: readonly string[];
  readyForNextPhase: boolean;
  confidence: number;
  validatedBy?: string[];
  validatedAt: Date;
  nextPhaseRecommendations?: readonly string[];
}

export interface Risk {
  readonly id: string;
  type: RiskType;
  description: string;
  severity: RiskSeverity;
  probability: number;
  impact: number;
  mitigation: string;
  owner?: string;
  dueDate?: Date;
  status: "identified" | "mitigating" | "resolved" | "accepted";
  dependencies?: readonly string[];
}

export interface ScalabilityPlan {
  currentCapacity: string;
  targetCapacity: string;
  scalingStrategy: string;
  bottlenecks: readonly string[];
  solutions: readonly string[];
}

export interface SecurityPlan {
  threats: readonly string[];
  mitigations: readonly string[];
  compliance: readonly string[];
  auditRequirements: readonly string[];
}

export interface CompliancePlan {
  standards: readonly string[];
  requirements: readonly string[];
  documentation: readonly string[];
  auditSchedule?: string;
}

export interface CostEstimate {
  development: number;
  infrastructure: number;
  maintenance: number;
  total: number;
  currency: string;
  assumptions: readonly string[];
  updatedAt: Date;
}

export interface DiscoveryReport {
  readonly sessionId: string;
  title: string;
  problemAnalysis: ProblemAnalysis;
  brainstormingResults: readonly BrainstormingResult[];
  prioritization: PrioritizationResult;
  architecture: ArchitecturePlan;
  validation: ValidationResult;
  summary: string;
  nextSteps: readonly string[];
  generatedAt: Date;
  version: string;
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  generatedBy: string;
  templateVersion: string;
  qualityScore?: number;
  reviewStatus: "draft" | "reviewed" | "approved" | "rejected";
  reviewedBy?: string[];
  reviewedAt?: Date;
  exportFormats: readonly string[];
}

export interface TechniqueConfig {
  readonly id: string;
  name: string;
  description: string;
  duration: string;
  steps: readonly string[];
  prompts: readonly string[];
  expectedOutputs: readonly string[];
  prerequisites?: readonly string[];
  materials?: readonly string[];
  groupSize?: {
    min: number;
    max: number;
    optimal: number;
  };
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "divergent" | "convergent" | "evaluative" | "creative";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ValidationSchema {
  [key: string]: {
    type: string;
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: readonly string[];
  };
}