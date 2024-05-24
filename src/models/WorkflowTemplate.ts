import { Model } from '@burand/functions/firestore';

export interface WorkflowTemplate extends Model {
  activeVersion: string;
  description: string;
  name: string;
}
