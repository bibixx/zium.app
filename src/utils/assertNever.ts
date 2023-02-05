export function assertNever(arg: never): never {
  throw new Error(`Unexpected value: ${arg}`);
}
