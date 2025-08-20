type Success<T> = { state: "success"; data: T };
type Failure<E> = { state: "failure"; error: E };
export type Result<T, E = Error> = Success<T> | Failure<E>;

export const Result = {
  success: <T>(data: T): Success<T> => ({ state: "success", data }),
  failure: <E>(error: E): Failure<E> => ({ state: "failure", error }),
};
