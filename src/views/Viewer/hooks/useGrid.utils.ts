export const GRID_STEP = 1.5;

export const getWindowSizeGridXMultiplier = (windowWidth: number) => {
  if (windowWidth < 1300) {
    return 2;
  }

  return 1;
};

export const getWindowSizeGridYMultiplier = (windowHeight: number) => {
  if (windowHeight < 800) {
    return 4;
  }

  return 2;
};

export const percentToFraction = (value: number) => value / 100;
