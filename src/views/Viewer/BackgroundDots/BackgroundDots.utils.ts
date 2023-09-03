export const drawDots = (
  windowHeight: number,
  windowWidth: number,
  gridSize: [number, number],
  ctx: CanvasRenderingContext2D,
) => {
  const [gridSizeX, gridSizeY] = gridSize;
  const horizontalDotsCount = Math.ceil(windowWidth / gridSizeX);
  const verticalDotsCount = Math.ceil(windowHeight / gridSizeY);

  for (let y = 0; y < verticalDotsCount; y++) {
    for (let x = 0; x < horizontalDotsCount; x++) {
      ctx.fillRect(x * gridSizeX, y * gridSizeY, 3, 3);
    }
  }
};
