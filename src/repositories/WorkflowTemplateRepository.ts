import { FirebaseAbstract } from '@burand/functions/firestore';
import { singleton } from 'tsyringe';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { WorkflowTemplate } from '../models/WorkflowTemplate.js';

@singleton()
export class WorkflowTemplateRepository extends FirebaseAbstract<WorkflowTemplate> {
  constructor() {
    super(FirestoreCollecionName.WORKFLOW_TEMPLATES);
  }
}
