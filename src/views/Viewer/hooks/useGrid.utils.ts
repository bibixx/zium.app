export const GRID_STEP = 1.5;

export const getWindowSizeGridXMultiplier = (windowWidth: number) => {
  return 1;
};

export const getWindowSizeGridYMultiplier = (windowHeight: number) => {
  if (windowHeight < 800) {
    return 3;
  }

  return 1.5;
};

export const percentToFraction = (value: number) => value / 100;
