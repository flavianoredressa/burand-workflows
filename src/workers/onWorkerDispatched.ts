import { ofFirestore } from '@burand/functions/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { Request, TaskQueueFunction, TaskQueueOptions, onTaskDispatched } from 'firebase-functions/v2/tasks';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { WorkflowExecution } from '../models/WorkflowExecution.js';

const { WORKFLOW_EXECUTIONS } = FirestoreCollecionName;

export interface WorkerDispatched<T> {
  payload: T;
  stepName: string;
  userId: string | null;
  workerId: string;
}

export function onWorkerDispatched<T>(
  options: TaskQueueOptions,
  handler: (request: Request<WorkerDispatched<T>>) => void | Promise<void>
): TaskQueueFunction<WorkerDispatched<T>> {
  const mergeOptions = {
    retryConfig: {
      maxAttempts: 3
    },
    ...options
  };

  return onTaskDispatched<WorkerDispatched<T>>(mergeOptions, async event => {
    await getFirestore().runTransaction(async t => {
      const workerExecutionRef = getFirestore().collection(WORKFLOW_EXECUTIONS).doc(event.data.workerId);
      const doc = await t.get(workerExecutionRef);
      const data = ofFirestore<WorkflowExecution>(doc);

      const step = data.steps.find(s => s.step === event.data.stepName);
      if (!step) {
        return;
      }

      step.retries = event.retryCount;
      step.maxAttempts = mergeOptions.retryConfig.maxAttempts as number;

      step.startedAt = new Date();
      step.status = 'running';
      step.logs.push({
        createdAt: new Date(),
        status: 'running'
      });

      if (event.headers?.['x-cloud-trace-context']) {
        step.trace.push(event.headers['x-cloud-trace-context']);
      }

      t.update(workerExecutionRef, {
        steps: data.steps,
        updatedAt: new Date()
      });
    });

    try {
      await handler(event);

      await getFirestore().runTransaction(async t => {
        const sfDocRef = getFirestore().collection(WORKFLOW_EXECUTIONS).doc(event.data.workerId);
        const doc = await t.get(sfDocRef);
        const data = ofFirestore<WorkflowExecution>(doc);

        const step = data.steps.find(s => s.step === event.data.stepName);
        if (!step) {
          return;
        }

        step.completedAt = new Date();
        step.status = 'completed';
        step.logs.push({
          createdAt: new Date(),
          status: 'completed'
        });

        t.update(sfDocRef, {
          steps: data.steps,
          updatedAt: new Date()
        });
      });
    } catch (err) {
      logger.error('Error caught in onWorkerDispatched', err);

      await getFirestore().runTransaction(async t => {
        const sfDocRef = getFirestore().collection(WORKFLOW_EXECUTIONS).doc(event.data.workerId);
        const doc = await t.get(sfDocRef);
        const data = ofFirestore<WorkflowExecution>(doc);

        const step = data.steps.find(s => s.step === event.data.stepName);
        if (!step) {
          return;
        }

        step.status = 'failed';
        step.logs.push({
          createdAt: new Date(),
          status: 'failed'
        });

        t.update(sfDocRef, {
          steps: data.steps,
          updatedAt: new Date()
        });
      });

      throw err;
    }
  });
}
