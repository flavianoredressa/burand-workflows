export function itWasLastAttempt(retries: number, maxAttempts: number): boolean {
  return retries === maxAttempts - 1;
}
