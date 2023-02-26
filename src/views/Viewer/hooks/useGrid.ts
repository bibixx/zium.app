import { useMemo } from "react";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { usePressedModifiers } from "./usePressedModifiers";
import {
  getWindowSizeGridXMultiplier,
  getWindowSizeGridYMultiplier,
  percentToFraction,
  GRID_STEP,
} from "./useGrid.utils";

export const useGrid = () => {
  const { height: windowHeight, width: windowWidth } = useWindowSize();
  const { meta, shift } = usePressedModifiers();

  const baseGrid = useMemo(() => {
    const xMultiplier = getWindowSizeGridXMultiplier(windowWidth) / 2;
    const yMultiplier = getWindowSizeGridYMultiplier(windowHeight) / 2;
    const xGrid = percentToFraction(GRID_STEP) * windowWidth;
    const yGrid = percentToFraction(GRID_STEP) * windowHeight;

    return [xGrid * xMultiplier, yGrid * yMultiplier] as [number, number];
  }, [windowHeight, windowWidth]);

  const grid = useMemo(() => {
    if (meta) {
      return undefined;
    }

    const baseXGrid = baseGrid[0];
    const baseYGrid = baseGrid[1];
    const multiplier = shift ? 0.5 : 1;

    return [baseXGrid * multiplier, baseYGrid * multiplier] as [number, number];
  }, [baseGrid, meta, shift]);

  return { baseGrid, grid };
};
