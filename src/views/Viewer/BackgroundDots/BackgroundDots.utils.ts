const DOTS_PER_SET = 500;
export const calculateBoxShadow = (windowHeight: number, windowWidth: number, gridSize: [number, number]) => {
  const [gridSizeX, gridSizeY] = gridSize;
  const horizontalDotsCount = Math.ceil(windowWidth / gridSizeX);
  const verticalDotsCount = Math.ceil(windowHeight / gridSizeY);
  const horizontalDots = Array.from({ length: horizontalDotsCount });
  const verticalDots = Array.from({ length: verticalDotsCount });

  const dots = verticalDots.flatMap((_, y) =>
    horizontalDots.map((_, x) => `${x * gridSizeX}px ${y * gridSizeY}px 0 1px var(--dotColor)`),
  );

  const setsOfDotsCount = Math.ceil(dots.length / DOTS_PER_SET);
  const boxShadows: string[] = [];

  for (let i = 0; i < setsOfDotsCount; i++) {
    const boxShadow = dots.slice(i * DOTS_PER_SET, (i + 1) * DOTS_PER_SET).join(", ");

    boxShadows.push(boxShadow);
  }

  return boxShadows;
};
