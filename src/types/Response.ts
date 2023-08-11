export type Response<T> =
  | { state: "loading"; data?: never }
  | { state: "error"; data?: never; error: Error }
  | { state: "done"; data: T };
