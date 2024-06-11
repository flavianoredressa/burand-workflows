import { FirebaseAbstract } from '@burand/functions/firestore';
import { singleton } from 'tsyringe';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { Workflow } from '../models/Workflow.js';

@singleton()
export class WorkflowRepository extends FirebaseAbstract<Workflow> {
  constructor() {
    super(FirestoreCollecionName.WORKFLOWS);
  }
}
