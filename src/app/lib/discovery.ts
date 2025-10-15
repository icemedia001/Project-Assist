import { prisma } from '@/app/config';

export const createDiscoverySession = async (
  userId: string,
  agentSessionId: string,
  problemStatement?: string,
  title?: string
) => {
  return await prisma.discoverySession.create({
    data: {
      userId,
      agentSessionId,
      title,
      problemStatement,
      currentPhase: 'setup',
      techniquesUsed: [],
      status: 'active',
    },
  });
};

export const updateDiscoveryPhase = async (
  agentSessionId: string,
  phase: string,
  metadata?: any
) => {
  return await prisma.discoverySession.update({
    where: { agentSessionId },
    data: {
      currentPhase: phase,
      metadata,
      updatedAt: new Date(),
    },
  });
};

export const addTechnique = async (
  agentSessionId: string,
  technique: string
) => {
  const session = await prisma.discoverySession.findUnique({
    where: { agentSessionId },
  });

  if (!session) throw new Error('Discovery session not found');

  const updatedTechniques = [...session.techniquesUsed, technique];
  
  return await prisma.discoverySession.update({
    where: { agentSessionId },
    data: {
      techniquesUsed: updatedTechniques,
      updatedAt: new Date(),
    },
  });
};

export const saveIdea = async (
  discoverySessionId: string,
  idea: {
    title: string;
    description: string;
    rationale?: string;
    feasibility?: 'High' | 'Medium' | 'Low';
    impact?: 'Strong' | 'Medium' | 'Weak';
    effort?: 'High' | 'Medium' | 'Low';
    metadata?: any;
  }
) => {
  const score = calculateIdeaScore(idea.feasibility, idea.impact, idea.effort);

  return await prisma.idea.create({
    data: {
      discoverySessionId,
      title: idea.title,
      description: idea.description,
      rationale: idea.rationale,
      feasibility: idea.feasibility,
      impact: idea.impact,
      effort: idea.effort,
      score,
      metadata: idea.metadata,
    },
  });
};

export const getIdeasForSession = async (discoverySessionId: string) => {
  return await prisma.idea.findMany({
    where: { discoverySessionId },
    orderBy: { score: 'desc' },
  });
};

export const createIdeaCluster = async (
  discoverySessionId: string,
  name: string,
  description?: string,
  color?: string
) => {
  return await prisma.ideaCluster.create({
    data: {
      discoverySessionId,
      name,
      description,
      color,
    },
  });
};

export const addIdeaToCluster = async (ideaId: string, clusterId: string) => {
  return await prisma.ideaClusterMembership.create({
    data: {
      ideaId,
      clusterId,
    },
  });
};

export const getClustersForSession = async (discoverySessionId: string) => {
  return await prisma.ideaCluster.findMany({
    where: { discoverySessionId },
    include: {
      memberships: {
        include: {
          idea: true,
        },
      },
    },
  });
};

export const saveRecommendation = async (
  discoverySessionId: string,
  recommendation: {
    type: 'next_step' | 'tech_stack' | 'team_role' | 'risk';
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
    category?: 'technical' | 'business' | 'design' | 'marketing';
    metadata?: any;
  }
) => {
  return await prisma.recommendation.create({
    data: {
      discoverySessionId,
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority || 'medium',
      category: recommendation.category,
      metadata: recommendation.metadata,
    },
  });
};

export const getRecommendationsForSession = async (discoverySessionId: string) => {
  return await prisma.recommendation.findMany({
    where: { discoverySessionId },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });
};

const calculateIdeaScore = (
  feasibility?: string,
  impact?: string,
  effort?: string
): number => {
  const scores = {
    High: 3,
    Strong: 3,
    Medium: 2,
    Low: 1,
    Weak: 1,
  };

  const feasibilityScore = scores[feasibility as keyof typeof scores] || 0;
  const impactScore = scores[impact as keyof typeof scores] || 0;
  const effortScore = scores[effort as keyof typeof scores] || 0;

  return (feasibilityScore + impactScore + (4 - effortScore)) / 3;
};

export const getDiscoverySession = async (agentSessionId: string) => {
  return await prisma.discoverySession.findUnique({
    where: { agentSessionId },
    include: {
      ideas: {
        orderBy: { score: 'desc' },
      },
      clusters: {
        include: {
          memberships: {
            include: {
              idea: true,
            },
          },
        },
      },
      recommendations: {
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      },
    },
  });
};

export const completeDiscoverySession = async (agentSessionId: string) => {
  return await prisma.discoverySession.update({
    where: { agentSessionId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });
};
