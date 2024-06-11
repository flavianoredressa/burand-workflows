import { WorkflowStatus } from '../types/WorkflowStatus.js';

export interface WorkflowStepLog {
  createdAt: Date;
  status: WorkflowStatus;
}
