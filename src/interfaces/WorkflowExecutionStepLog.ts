import { WorkflowExecutionStatus } from '../types/WorkflowExecutionStatus.js';

export interface WorkflowExecutionStepLog {
  createdAt: Date;
  status: WorkflowExecutionStatus;
}
