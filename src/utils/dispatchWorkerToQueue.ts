import { getFunctions } from 'firebase-admin/functions';

import { WorkerDispatched } from '../workers/onWorkerDispatched.js';

interface Params extends WorkerDispatched<unknown> {
  call: string;
}

export async function dispatchWorkerToQueue({ workerId, call, payload, stepName, userId }: Params): Promise<void> {
  await getFunctions()
    .taskQueue(call)
    .enqueue({
      payload,
      workerId,
      stepName,
      userId
    } satisfies WorkerDispatched<unknown>);
}
