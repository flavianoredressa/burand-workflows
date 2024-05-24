import { AddDocument } from '@burand/functions/typings';

import { WorkflowExecution } from '../models/WorkflowExecution.js';
import { WorkflowTemplate } from '../models/WorkflowTemplate.js';
import { WorkflowTemplateVersion } from '../models/WorkflowTemplateVersion.js';
import { mapWorkflowTemplateStepsToExecutionSteps } from './mapWorkflowTemplateStepsToExecutionSteps.js';

export function mapWorkflowTemplateToExecution(
  template: WorkflowTemplate,
  version: WorkflowTemplateVersion
): AddDocument<WorkflowExecution> {
  const steps = mapWorkflowTemplateStepsToExecutionSteps(version.steps);

  return {
    completedAt: null,
    payload: null,
    startedAt: null,
    status: 'idle',
    steps,
    templateId: template.id,
    userId: null,
    version: template.activeVersion
  } satisfies AddDocument<WorkflowExecution>;
}
