export interface WorkflowTemplateStep {
  call: string;
  description: string;
  name: string;
  next: string | null;
  parallel: string[];
  step: string;
}
