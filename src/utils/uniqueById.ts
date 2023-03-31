export const uniqueById = <T extends { id: string }>(array: T[]) => {
  const visitedIds: Record<string, boolean> = {};

  return array.filter((el) => {
    const found = visitedIds[el.id];

    if (found) {
      return false;
    }

    visitedIds[el.id] = true;
    return true;
  });
};
