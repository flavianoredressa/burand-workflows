import { DocumentNotFoundError } from '@burand/functions/exceptions';
import { FirebaseAbstract } from '@burand/functions/firestore';
import { singleton } from 'tsyringe';

import { FirestoreCollecionName } from '../config/FirestoreCollecionName.js';
import { WorkflowTemplateVersion } from '../models/WorkflowTemplateVersion.js';

@singleton()
export class WorkflowTemplateVersionRepository extends FirebaseAbstract<WorkflowTemplateVersion> {
  constructor() {
    super(FirestoreCollecionName.WORKFLOW_TEMPLATE_VERSIONS);
  }

  async getByVersion(templateId: string, version: string): Promise<WorkflowTemplateVersion> {
    const find = await this.getOneWhereMany([
      ['templateId', '==', templateId],
      ['version', '==', version]
    ]);

    if (!find) {
      throw new DocumentNotFoundError();
    }

    return find;
  }
}
