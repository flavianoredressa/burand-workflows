import { getFunctions } from 'firebase-admin/functions';
import { WorkerDispatched } from './runStep.js';

interface Params extends WorkerDispatched {
  call: string;
}

export function dispatchWorkerToQueue({ workflowId, call }: Params): Promise<void> {
  return getFunctions().taskQueue(call).enqueue({ workflowId });
}
