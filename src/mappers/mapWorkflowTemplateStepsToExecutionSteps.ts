import { WorkflowStep } from '../interfaces/WorkflowStep.js';

export function mapWorkflowTemplateStepsToExecutionSteps(steps: string[]): WorkflowStep[] {
  return steps.map(id => {
    return {
      completedAt: null,
      id,
      logs: [],
      startedAt: null,
      status: 'idle'
    } satisfies WorkflowStep;
  });
}
