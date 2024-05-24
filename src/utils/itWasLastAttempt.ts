import { WorkflowExecutionStep } from '../interfaces/WorkflowExecutionStep.js';

export function itWasLastAttempt(step: WorkflowExecutionStep): boolean {
  return step.retries === step.maxAttempts - 1;
}
