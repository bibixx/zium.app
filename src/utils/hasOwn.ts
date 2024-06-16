export const hasOwn = <T extends string>(object: unknown, key: T): object is Record<T, unknown> => {
  if (typeof object !== "object" || object == null) {
    return false;
  }

  return Object.hasOwn(object, key);
};
