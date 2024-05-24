import { WorkflowExecutionStep } from '../interfaces/WorkflowExecutionStep.js';
import { WorkflowTemplateStep } from '../interfaces/WorkflowTemplateStep.js';

export function mapWorkflowTemplateStepsToExecutionSteps(steps: WorkflowTemplateStep[]): WorkflowExecutionStep[] {
  return steps.map(({ step, name, next, parallel, call }) => {
    return {
      step,
      name,
      next,
      parallel,
      call,
      completedAt: null,
      trace: [],
      startedAt: null,
      status: 'idle',
      logs: [],
      maxAttempts: 0,
      retries: 0
    } satisfies WorkflowExecutionStep;
  });
}
