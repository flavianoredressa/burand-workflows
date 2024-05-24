import { Model } from '@burand/functions/firestore';

import { WorkflowExecutionStep } from '../interfaces/WorkflowExecutionStep.js';
import { WorkflowExecutionStatus } from '../types/WorkflowExecutionStatus.js';

export interface WorkflowExecution<T = unknown> extends Model {
  completedAt: Date | null;
  payload: T;
  startedAt: Date | null;
  status: WorkflowExecutionStatus;
  steps: WorkflowExecutionStep[];
  templateId: string;
  userId: string | null;
  version: string;
}
