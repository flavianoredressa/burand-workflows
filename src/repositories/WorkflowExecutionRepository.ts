import { FirebaseAbstract } from '@burand/functions/firestore';
import { singleton } from 'tsyringe';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { WorkflowExecution } from '../models/WorkflowExecution.js';

@singleton()
export class WorkflowExecutionRepository extends FirebaseAbstract<WorkflowExecution> {
  constructor() {
    super(FirestoreCollecionName.WORKFLOW_EXECUTIONS);
  }
}
