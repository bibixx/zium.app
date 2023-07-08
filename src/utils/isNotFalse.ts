export function isNotFalse<T>(o: T | false): o is T {
  return o !== false;
}
