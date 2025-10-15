import { createTool } from '@iqai/adk';
import { z } from 'zod';

/**
 * Flow Processor Tool - Manages complex multi-step workflows
 * This tool helps coordinate complex discovery processes with proper flow control
 */

export const createWorkflowTool = createTool({
  name: "create_workflow",
  description: "Create a structured workflow for complex discovery processes",
  schema: z.object({
    workflowName: z.string().describe("Name of the workflow"),
    steps: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      agent: z.enum(["brain", "analyst", "pm", "architect", "validator"]),
      tools: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional(),
      estimatedDuration: z.string().optional()
    })).describe("Workflow steps"),
    parallelExecution: z.boolean().optional().describe("Whether steps can run in parallel")
  }),
  fn: async ({ workflowName, steps, parallelExecution }, context) => {
    const workflow = {
      id: `workflow_${Date.now()}`,
      name: workflowName,
      steps,
      parallelExecution: parallelExecution || false,
      status: "created",
      currentStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const workflows = context.state.get("workflows", []);
    context.state.set("workflows", [...workflows, workflow]);
    context.state.set("active_workflow", workflow.id);

    try {
      await context.saveArtifact(
        `workflow_${workflow.id}.json`,
        { text: JSON.stringify(workflow, null, 2) }
      );
    } catch (error) {
      console.warn("Failed to save workflow as artifact:", error);
    }

    return {
      success: true,
      workflow,
      message: `✅ Created workflow: "${workflowName}" with ${steps.length} steps`
    };
  }
});

export const executeWorkflowStepTool = createTool({
  name: "execute_workflow_step",
  description: "Execute a specific step in the current workflow",
  schema: z.object({
    stepId: z.string().describe("ID of the step to execute"),
    input: z.string().optional().describe("Input for the step execution")
  }),
  fn: async ({ stepId, input }, context) => {
    const workflows = context.state.get("workflows", []);
    const activeWorkflowId = context.state.get("active_workflow");
    
    if (!activeWorkflowId) {
      return {
        success: false,
        error: "No active workflow",
        message: "Please create a workflow first"
      };
    }

    const workflow = workflows.find((w: any) => w.id === activeWorkflowId);
    if (!workflow) {
      return {
        success: false,
        error: "Workflow not found",
        message: "Active workflow not found"
      };
    }

    const step = workflow.steps.find((s: any) => s.id === stepId);
    if (!step) {
      return {
        success: false,
        error: "Step not found",
        message: `Step ${stepId} not found in workflow`
      };
    }

    workflow.currentStep = workflow.steps.findIndex((s: any) => s.id === stepId);
    workflow.status = "in_progress";
    workflow.updatedAt = new Date().toISOString();

    const stepExecutions = context.state.get("step_executions", []);
    const stepExecution = {
      id: `execution_${Date.now()}`,
      workflowId: workflow.id,
      stepId,
      status: "executing",
      input,
      startedAt: new Date().toISOString(),
      agent: step.agent
    };

    context.state.set("step_executions", [...stepExecutions, stepExecution]);
    context.state.set("workflows", workflows);

    return {
      success: true,
      stepExecution,
      workflow,
      message: `🚀 Executing step: "${step.name}" using ${step.agent} agent`
    };
  }
});

export const completeWorkflowStepTool = createTool({
  name: "complete_workflow_step",
  description: "Mark a workflow step as completed with results",
  schema: z.object({
    stepId: z.string().describe("ID of the completed step"),
    results: z.any().describe("Results from the step execution"),
    nextSteps: z.array(z.string()).optional().describe("Suggested next steps")
  }),
  fn: async ({ stepId, results, nextSteps }, context) => {
    const workflows = context.state.get("workflows", []);
    const stepExecutions = context.state.get("step_executions", []);
    const activeWorkflowId = context.state.get("active_workflow");

    if (!activeWorkflowId) {
      return {
        success: false,
        error: "No active workflow",
        message: "No active workflow found"
      };
    }

    const workflow = workflows.find((w: any) => w.id === activeWorkflowId);
    const stepExecution = stepExecutions.find((se: any) => se.stepId === stepId);

    if (!workflow || !stepExecution) {
      return {
        success: false,
        error: "Workflow or step execution not found",
        message: "Unable to complete step"
      };
    }

    stepExecution.status = "completed";
    stepExecution.results = results;
    stepExecution.completedAt = new Date().toISOString();
    stepExecution.nextSteps = nextSteps;

    workflow.updatedAt = new Date().toISOString();
    
    const completedSteps = stepExecutions.filter((se: any) => 
      se.workflowId === workflow.id && se.status === "completed"
    );

    if (completedSteps.length === workflow.steps.length) {
      workflow.status = "completed";
      workflow.completedAt = new Date().toISOString();
    }

    context.state.set("step_executions", stepExecutions);
    context.state.set("workflows", workflows);

    try {
      await context.saveArtifact(
        `step_completion_${stepId}_${Date.now()}.json`,
        { text: JSON.stringify(stepExecution, null, 2) }
      );
    } catch (error) {
      console.warn("Failed to save step completion as artifact:", error);
    }

    return {
      success: true,
      stepExecution,
      workflow,
      isWorkflowComplete: workflow.status === "completed",
      message: `✅ Completed step: "${stepId}"${workflow.status === "completed" ? " - Workflow complete!" : ""}`
    };
  }
});

export const getWorkflowStatusTool = createTool({
  name: "get_workflow_status",
  description: "Get the current status of the active workflow",
  schema: z.object({}),
  fn: (_, context) => {
    const workflows = context.state.get("workflows", []);
    const stepExecutions = context.state.get("step_executions", []);
    const activeWorkflowId = context.state.get("active_workflow");

    if (!activeWorkflowId) {
      return {
        success: false,
        message: "No active workflow"
      };
    }

    const workflow = workflows.find((w: any) => w.id === activeWorkflowId);
    if (!workflow) {
      return {
        success: false,
        message: "Active workflow not found"
      };
    }

    const workflowExecutions = stepExecutions.filter((se: any) => 
      se.workflowId === workflow.id
    );

    const completedSteps = workflowExecutions.filter((se: any) => 
      se.status === "completed"
    );

    const inProgressSteps = workflowExecutions.filter((se: any) => 
      se.status === "executing"
    );

    return {
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        totalSteps: workflow.steps.length,
        completedSteps: completedSteps.length,
        inProgressSteps: inProgressSteps.length,
        currentStep: workflow.currentStep,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      },
      stepExecutions: workflowExecutions,
      progress: {
        percentage: Math.round((completedSteps.length / workflow.steps.length) * 100),
        completed: completedSteps.length,
        total: workflow.steps.length
      }
    };
  }
});

export const workflowTools = () => [
  createWorkflowTool,
  executeWorkflowStepTool,
  completeWorkflowStepTool,
  getWorkflowStatusTool
];
