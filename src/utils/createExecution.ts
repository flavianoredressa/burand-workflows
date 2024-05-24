import { container } from 'tsyringe';

import { CreateWorkflowExecutionOptions, WorkflowExecutionService } from '../services/WorkflowExecutionService.js';

export function createExecution(options: CreateWorkflowExecutionOptions) {
  const workflowExecutionService = container.resolve(WorkflowExecutionService);
  return workflowExecutionService.create(options);
}
