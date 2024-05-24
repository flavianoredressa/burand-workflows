import { WorkflowExecutionStep } from '../interfaces/WorkflowExecutionStep.js';

export function findCompletedStep(
  previousSteps: WorkflowExecutionStep[],
  currentSteps: WorkflowExecutionStep[]
): WorkflowExecutionStep | null {
  const previousStepsMap = new Map(previousSteps.map(step => [step.step, step]));

  for (const currentStep of currentSteps) {
    const previousStep = previousStepsMap.get(currentStep.step);
    if (previousStep && previousStep.status === 'running' && currentStep.status !== previousStep.status) {
      return currentStep;
    }
  }

  return null;
}
