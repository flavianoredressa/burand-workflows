import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { TaskQueueFunction, TaskQueueOptions, onTaskDispatched } from 'firebase-functions/v2/tasks';
import { container } from 'tsyringe';

import { FirestoreCollecionName } from './config/FirestoreCollecionName.js';
import { StepFunction } from './createStep.js';
import { WorkflowService } from './services/WorkflowService.js';
import { hasDuplicateIds } from './utils/hasDuplicateIds.js';
import { itWasLastAttempt } from './utils/itWasLastAttempt.js';
import { WorkerDispatched, runStep } from './utils/runStep.js';

const { WORKFLOWS } = FirestoreCollecionName;

interface WorkflowOptions extends TaskQueueOptions {
  name: string;
  call: string;
}

type WorkflowRun<T> = (options: { payload: T }) => Promise<void>;
type Worker = TaskQueueFunction;

type WorkflowFunction<T> = [WorkflowRun<T>, Worker];

export function createWorkflow<T>(options: WorkflowOptions, ...invokeFns: StepFunction<T>[]): WorkflowFunction<T> {
  hasDuplicateIds(invokeFns);

  const mergeOptions = {
    retryConfig: {
      maxAttempts: 3
    },
    ...options
  };

  return [
    async (options: { payload: unknown }) => {
      const workflowService = container.resolve(WorkflowService);
      await workflowService.create({
        payload: options.payload,
        name: mergeOptions.name,
        call: mergeOptions.call,
        steps: invokeFns.map(fn => fn.id)
      });
    },
    onTaskDispatched<WorkerDispatched>(mergeOptions, async event => {
      await getFirestore().runTransaction(async t => {
        t.update(getFirestore().collection(WORKFLOWS).doc(event.data.workflowId), {
          status: 'running',
          retries: event.retryCount,
          maxAttempts: mergeOptions.retryConfig.maxAttempts,
          startedAt: new Date(),
          updatedAt: new Date(),
          ...(event.headers?.['x-cloud-trace-context']
            ? { trace: FieldValue.arrayUnion(event.headers['x-cloud-trace-context']) }
            : {})
        });
      });

      try {
        for (const invokeFn of invokeFns) {
          await runStep(invokeFn, event);
        }

        await getFirestore().runTransaction(async t => {
          t.update(getFirestore().collection(WORKFLOWS).doc(event.data.workflowId), {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          });
        });
      } catch (err) {
        if (itWasLastAttempt(event.retryCount, mergeOptions.retryConfig.maxAttempts as number)) {
          await getFirestore().runTransaction(async t => {
            t.update(getFirestore().collection(WORKFLOWS).doc(event.data.workflowId), {
              status: 'failed',
              updatedAt: new Date()
            });
          });
        }

        throw err;
      }
    })
  ];
}
