export type StepFunction<T> = {
  id: string;
  handler: (payload: T) => void | Promise<void>;
};

export function createStep<T>(id: string, handler: (payload: T) => void | Promise<void>): StepFunction<T> {
  return {
    id,
    handler
  };
}
