import { singleton } from 'tsyringe';

import { mapWorkflowTemplateToExecution } from '../mappers/mapWorkflowTemplateToExecution.js';
import { WorkflowRepository } from '../repositories/WorkflowRepository.js';
import { dispatchWorkerToQueue } from '../utils/dispatchWorkerToQueue.js';
import { generateGoogleLoggingURL } from '../utils/generateGoogleLoggingURL.js';

export interface CreateWorkflowExecutionOptions {
  name: string;
  call: string;
  steps: string[];
  payload: unknown;
}

@singleton()
export class WorkflowService {
  constructor(private workflowRepository: WorkflowRepository) {}

  async create({ payload, steps, name, call }: CreateWorkflowExecutionOptions): Promise<string> {
    const execution = mapWorkflowTemplateToExecution(name, call, steps);

    const workflowId = await this.workflowRepository.add({
      ...execution,
      payload
    });

    await dispatchWorkerToQueue({
      workflowId,
      call
    });

    return workflowId;
  }

  async clone(workflowId: string): Promise<string> {
    const { name, call, payload, steps } = await this.workflowRepository.getById(workflowId);

    return this.create({
      name,
      call,
      payload,
      steps: steps.map(step => step.id)
    });
  }

  async retry(workflowId: string): Promise<void> {
    const { call } = await this.workflowRepository.getById(workflowId);

    await dispatchWorkerToQueue({
      workflowId,
      call
    });
  }

  async generateGoogleLoggingURL(workflowId: string): Promise<string> {
    const { trace } = await this.workflowRepository.getById(workflowId);
    return generateGoogleLoggingURL(trace);
  }
}
