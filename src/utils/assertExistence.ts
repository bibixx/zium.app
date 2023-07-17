import { isNotNullable } from "./isNotNullable";

export function assertExistence<T>(data: T | null | undefined): asserts data is T {
  if (isNotNullable(data)) {
    return;
  }

  throw new Error(`Passed value ${data} was nullable`);
}
