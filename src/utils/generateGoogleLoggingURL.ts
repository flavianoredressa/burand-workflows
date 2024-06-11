import { env } from 'node:process';

export function generateGoogleLoggingURL(traceIds: string[]): string {
  const baseURL = 'https://console.cloud.google.com/logs/query;';

  const traces = traceIds.map(id => `"projects/${env.GCLOUD_PROJECT}/traces/${id.split('/')[0]}"`).join(' OR ');
  const query = `trace = (${traces})`;

  const encodedQuery = encodeURIComponent(query);

  return `${baseURL}?query=${encodedQuery}&project=${env.GCLOUD_PROJECT}`;
}
