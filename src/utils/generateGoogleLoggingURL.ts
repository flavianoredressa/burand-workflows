export function generateGoogleLoggingURL(projectId: string, traceIds: string[]): string {
  const baseURL = 'https://console.cloud.google.com/logs/query;';

  const traces = traceIds.map(id => `"projects/${projectId}/traces/${id.split('/')[0]}"`).join(' OR ');
  const query = `trace = (${traces})`;

  const encodedQuery = encodeURIComponent(query);

  return `${baseURL}?query=${encodedQuery}&project=${projectId}`;
}
