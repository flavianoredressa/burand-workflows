import { createServer } from '@burand/functions/http';
import { Router } from 'express';
import { container } from 'tsyringe';

import { WorkflowRepository } from '../repositories/WorkflowRepository.js';
import { WorkflowService } from '../services/WorkflowService.js';
import { generateGoogleLoggingURL } from '../utils/generateGoogleLoggingURL.js';

const routes = Router();

routes.get('/:workflowId', async (request, response) => {
  const workflowRepository = container.resolve(WorkflowRepository);
  const workflow = await workflowRepository.getById(request.params.workflowId);

  response.json(workflow);
});

routes.get('/:workflowId/clone', async (request, response) => {
  const workflowService = container.resolve(WorkflowService);
  const id = await workflowService.clone(request.params.workflowId);

  response.redirect(`/${id}`);
});

routes.get('/:workflowId/logs', async (request, response) => {
  const workflowRepository = container.resolve(WorkflowRepository);

  const { trace } = await workflowRepository.getById(request.params.workflowId);
  const link = generateGoogleLoggingURL(trace);

  response.redirect(link);
});

routes.get('/:workflowId/retry', async (request, response) => {
  const workflowExecution = container.resolve(WorkflowService);
  await workflowExecution.retry(request.params.workflowId);

  response.redirect(`/${request.params.workflowId}`);
});

export const app = createServer(routes);
