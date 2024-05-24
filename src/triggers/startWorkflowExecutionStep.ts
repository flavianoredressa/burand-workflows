import { ofFirestore } from '@burand/functions/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { WorkflowExecution } from '../models/WorkflowExecution.js';
import { dispatchWorkersToQueue } from '../utils/dispatchWorkersToQueue.js';

const { WORKFLOW_EXECUTIONS } = FirestoreCollecionName;

export const startWorkflowExecutionStep = onDocumentCreated(`${WORKFLOW_EXECUTIONS}/{executionId}`, async event => {
  if (!event.data) {
    return;
  }

  const data = ofFirestore<WorkflowExecution>(event.data);

  const [step] = data.steps;

  await event.data.ref.update({
    status: 'running',
    startedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await dispatchWorkersToQueue(data, step);
});
