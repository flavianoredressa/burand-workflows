import { singleton } from 'tsyringe';

import { mapWorkflowTemplateToExecution } from '../mappers/mapWorkflowTemplateToExecution.js';
import { WorkflowExecutionRepository } from '../repositories/WorkflowExecutionRepository.js';
import { WorkflowTemplateRepository } from '../repositories/WorkflowTemplateRepository.js';
import { WorkflowTemplateVersionRepository } from '../repositories/WorkflowTemplateVersionRepository.js';
import { dispatchWorkerToQueue } from '../utils/dispatchWorkerToQueue.js';
import { generateGoogleLoggingURL } from '../utils/generateGoogleLoggingURL.js';

export interface CreateWorkflowExecutionOptions {
  templateId: string;
  payload: unknown;
  userId: string | null;
}

@singleton()
export class WorkflowExecutionService {
  constructor(
    private workflowTemplateRepository: WorkflowTemplateRepository,
    private workflowTemplateVersionRepository: WorkflowTemplateVersionRepository,
    private workflowExecutionRepository: WorkflowExecutionRepository
  ) {}

  async create({ payload, templateId, userId }: CreateWorkflowExecutionOptions): Promise<string> {
    const template = await this.workflowTemplateRepository.getById(templateId);

    const templateVersion = await this.workflowTemplateVersionRepository.getByVersion(
      templateId,
      template.activeVersion
    );

    const execution = mapWorkflowTemplateToExecution(template, templateVersion);

    const id = await this.workflowExecutionRepository.add({
      ...execution,
      payload,
      userId
    });

    return id;
  }

  async clone(workflowExecutionId: string): Promise<string> {
    const { templateId, payload } = await this.workflowExecutionRepository.getById(workflowExecutionId);

    const template = await this.workflowTemplateRepository.getById(templateId);
    const templateVersion = await this.workflowTemplateVersionRepository.getByVersion(
      templateId,
      template.activeVersion
    );

    const execution = mapWorkflowTemplateToExecution(template, templateVersion);

    const id = await this.workflowExecutionRepository.add({
      ...execution,
      payload
    });

    return id;
  }

  async retry(workflowExecutionId: string): Promise<void> {
    const workflow = await this.workflowExecutionRepository.getById(workflowExecutionId);

    const stepsFailed = workflow.steps.filter(step => step.status === 'failed');

    if (stepsFailed.length) {
      await this.workflowExecutionRepository.update({
        id: workflowExecutionId,
        status: 'running'
      });

      const promises = [];

      for (const step of stepsFailed) {
        promises.push(
          dispatchWorkerToQueue({
            payload: workflow.payload,
            stepName: step.step,
            workerId: workflow.id,
            userId: workflow.userId,
            call: step.call
          })
        );
      }

      await Promise.all(promises);
    }
  }

  async generateGoogleLoggingURL(projectId: string, workflowExecutionId: string): Promise<string> {
    const worker = await this.workflowExecutionRepository.getById(workflowExecutionId);

    const link = generateGoogleLoggingURL(
      projectId,
      worker.steps.flatMap(s => s.trace)
    );

    return link;
  }
}
