import { ofFirestore } from '@burand/functions/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { Request } from 'firebase-functions/v2/tasks';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { StepFunction } from '../createStep.js';
import { Workflow } from '../models/Workflow.js';

const { WORKFLOWS } = FirestoreCollecionName;

export interface WorkerDispatched {
  workflowId: string;
}

export async function runStep<T>(invokeFn: StepFunction<T>, event: Request<WorkerDispatched>): Promise<void> {
  const { proceed, payload } = await getFirestore().runTransaction(async t => {
    const ref = getFirestore().collection(WORKFLOWS).doc(event.data.workflowId);
    const doc = await t.get(ref);
    const data = ofFirestore<Workflow<T>>(doc);

    const step = data.steps.find(s => s.id === invokeFn.id);
    if (!step) {
      return { proceed: false, payload: null as T };
    }

    if (step.status === 'completed' || step.status === 'running') {
      return { proceed: false, payload: null as T };
    }

    step.startedAt = new Date();
    step.status = 'running';
    step.logs.push({
      createdAt: new Date(),
      status: 'running'
    });

    t.update(ref, {
      steps: data.steps,
      updatedAt: new Date()
    });

    return { proceed: true, payload: data.payload };
  });

  if (!proceed) {
    return;
  }

  try {
    await invokeFn.handler(payload);

    await getFirestore().runTransaction(async t => {
      const ref = getFirestore().collection(WORKFLOWS).doc(event.data.workflowId);
      const doc = await t.get(ref);
      const data = ofFirestore<Workflow>(doc);

      const step = data.steps.find(s => s.id === invokeFn.id);
      if (!step) {
        return;
      }

      step.completedAt = new Date();
      step.status = 'completed';
      step.logs.push({
        createdAt: new Date(),
        status: 'completed'
      });

      t.update(ref, {
        steps: data.steps,
        updatedAt: new Date()
      });
    });
  } catch (err) {
    await getFirestore().runTransaction(async t => {
      const ref = getFirestore().collection(WORKFLOWS).doc(event.data.workflowId);
      const doc = await t.get(ref);
      const data = ofFirestore<Workflow>(doc);

      const step = data.steps.find(s => s.id === invokeFn.id);
      if (!step) {
        return;
      }

      step.status = 'failed';
      step.logs.push({
        createdAt: new Date(),
        status: 'failed'
      });

      t.update(ref, {
        steps: data.steps,
        updatedAt: new Date()
      });
    });

    throw err;
  }
}
