import { isNotNullable } from "./isNotNullable";

export function assertExistence<T>(data: T | null | undefined, customMessage?: string): asserts data is T {
  if (isNotNullable(data)) {
    return;
  }

  throw new Error(customMessage ?? `Passed value ${data} is nullable`);
}
