export type Response<T> =
  | { state: "loading"; data?: never }
  | { state: "error"; data?: never; error: Error | unknown }
  | { state: "done"; data: T };

export type ResponseAction<T> =
  | { type: "load" }
  | { type: "error"; error: Error | unknown }
  | { type: "done"; data: T };
