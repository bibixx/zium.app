export const GRID_STEP = 1.5;

export const getWindowSizeGridXMultiplier = (windowWidth: number) => {
  if (windowWidth > 3300) {
    return 0.5;
  }

  if (windowWidth > 2400) {
    return 1;
  }

  if (windowWidth > 1600) {
    return 1.5;
  }

  if (windowWidth > 900) {
    return 2;
  }

  return 3;
};

export const getWindowSizeGridYMultiplier = (windowHeight: number) => {
  if (windowHeight > 900) {
    return 1.5;
  }

  return 3;
};

export const percentToFraction = (value: number) => value / 100;
