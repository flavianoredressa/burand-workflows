import { AddDocument } from '@burand/functions/typings';

import { Workflow } from '../models/Workflow.js';
import { mapWorkflowTemplateStepsToExecutionSteps } from './mapWorkflowTemplateStepsToExecutionSteps.js';

export function mapWorkflowTemplateToExecution(name: string, call: string, stepIds: string[]): AddDocument<Workflow> {
  const steps = mapWorkflowTemplateStepsToExecutionSteps(stepIds);

  return {
    call,
    completedAt: null,
    maxAttempts: 0,
    name,
    payload: null,
    retries: 0,
    startedAt: null,
    status: 'idle',
    steps,
    trace: []
  } satisfies AddDocument<Workflow>;
}
