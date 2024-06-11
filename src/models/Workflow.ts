import { Model } from '@burand/functions/firestore';

import { WorkflowStep } from '../interfaces/WorkflowStep.js';
import { WorkflowStatus } from '../types/WorkflowStatus.js';

export interface Workflow<T = unknown> extends Model {
  call: string;
  completedAt: Date | null;
  maxAttempts: number;
  name: string;
  payload: T;
  retries: number;
  startedAt: Date | null;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  trace: string[];
}
