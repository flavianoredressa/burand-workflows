import { logger } from 'firebase-functions/v2';

import { WorkflowExecutionStep } from '../interfaces/WorkflowExecutionStep.js';
import { WorkflowExecution } from '../models/WorkflowExecution.js';
import { dispatchWorkerToQueue } from './dispatchWorkerToQueue.js';

export async function dispatchWorkersToQueue(
  { id, payload, steps, userId }: WorkflowExecution,
  step: WorkflowExecutionStep
): Promise<void> {
  await dispatchWorkerToQueue({
    userId,
    payload,
    call: step.call,
    stepName: step.step,
    workerId: id
  });

  const promises: Promise<void>[] = [];

  for (const parallel of step.parallel) {
    const parallelStep = steps.find(s => s.step === parallel);
    if (parallelStep) {
      promises.push(
        dispatchWorkerToQueue({
          userId,
          payload,
          call: parallelStep.call,
          stepName: parallelStep.step,
          workerId: id
        })
      );
    } else {
      logger.warn(`Parallel Step "${parallel}" not found.`);
    }
  }

  await Promise.all(promises);
}
