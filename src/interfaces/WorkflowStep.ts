import { WorkflowStatus } from '../types/WorkflowStatus.js';
import { WorkflowStepLog } from './WorkflowStepLog.js';

export interface WorkflowStep {
  completedAt: Date | null;
  id: string;
  logs: WorkflowStepLog[];
  startedAt: Date | null;
  status: WorkflowStatus;
}
