export const isNotNullable = <T>(el: T | null | undefined): el is T => {
  return el != null;
};
