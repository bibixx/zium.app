import {
  DataChannelGridWindow,
  DriverGridWindow,
  DriverTrackerGridWindow,
  GridWindow,
  MainGridWindow,
} from "../../../../types/GridWindow";
import { generateUID } from "../../../../utils/generateUID";
import { GridLayout, GridLayoutFillMode, WindowGridSavedLayout, WindowGridState } from "./useViewerState.utils";

interface WindowGridSavedLayoutBase {
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  fillMode: GridLayoutFillMode;
  window:
    | Omit<MainGridWindow, "id">
    | Omit<DriverTrackerGridWindow, "id">
    | Omit<DataChannelGridWindow, "id">
    | Omit<DriverGridWindow, "id">;
}

interface LayoutBase {
  name: string;
  data: WindowGridSavedLayoutBase[];
}

const race21_9: LayoutBase = {
  name: "Race (21:9)",
  data: [
    {
      width: 21.99951171875,
      height: 33.625,
      x: 77.99999872843425,
      y: 66.375,
      zIndex: 0,
      fillMode: "fill",
      window: { type: "driver", driverId: "PER" },
    },
    {
      width: 21.999918619791668,
      height: 32.625,
      x: 77.99999872843425,
      y: 33.75,
      zIndex: 1,
      fillMode: "fill",
      window: { type: "driver", driverId: "LEC" },
    },
    {
      width: 22.499593098958336,
      height: 33.625,
      x: 55.500405629475914,
      y: 66.375,
      zIndex: 2,
      fillMode: "fill",
      window: { type: "driver", driverId: "BOT" },
    },
    {
      width: 22.499593098958336,
      height: 32.625,
      x: 55.500405629475914,
      y: 33.75,
      zIndex: 3,
      fillMode: "fill",
      window: { type: "driver", driverId: "ALO" },
    },
    {
      width: 16.875,
      height: 23.5,
      x: 0,
      y: 76.5,
      zIndex: 4,
      fillMode: "fill",
      window: { type: "driver-tracker" },
    },
    {
      width: 19.87475713094076,
      height: 23.5,
      x: 35.62499999999999,
      y: 76.5,
      zIndex: 5,
      fillMode: "fill",
      window: { type: "driver", driverId: "NOR" },
    },
    {
      width: 18.749999999999993,
      height: 23.5,
      x: 16.875,
      y: 76.5,
      zIndex: 6,
      fillMode: "fill",
      window: { type: "driver", driverId: "OCO" },
    },
    {
      width: 55.49967447916667,
      height: 76.49991461748868,
      x: 0,
      y: 0,
      zIndex: 7,
      fillMode: "fill",
      window: { type: "main" },
    },
    {
      width: 26.8115234375,
      height: 33.75,
      x: 55.50097783406576,
      y: 0,
      zIndex: 8,
      fillMode: "fill",
      window: { type: "data-channel" },
    },
    {
      width: 21.99951171875,
      height: 33.7490234375,
      x: 77.99999999999999,
      y: 0,
      zIndex: 9,
      fillMode: "fill",
      window: { type: "driver", driverId: "HAM" },
    },
  ],
};

const race16_10: LayoutBase = {
  name: "Race (16:10)",
  data: [
    {
      width: 37,
      height: 31.374674768261546,
      x: 63,
      y: 68.62549800796812,
      zIndex: 0,
      fillMode: "fill",
      window: {
        type: "driver",
        driverId: "ALO",
      },
    },
    {
      width: 45,
      height: 40.373834369449376,
      x: 18,
      y: 59.626165630550624,
      zIndex: 1,
      fillMode: "fit",
      window: {
        type: "data-channel",
      },
    },
    {
      width: 37,
      height: 33.75,
      x: 63,
      y: 0,
      zIndex: 2,
      fillMode: "fill",
      window: {
        type: "driver",
        driverId: "SAI",
      },
    },
    {
      width: 37,
      height: 34.747806095102966,
      x: 63,
      y: 33.75,
      zIndex: 3,
      fillMode: "fill",
      window: {
        type: "driver",
        driverId: "VER",
      },
    },
    {
      width: 63,
      height: 59.62500000000001,
      x: 0,
      y: 0,
      zIndex: 4,
      fillMode: "fill",
      window: {
        type: "main",
      },
    },
  ],
};

const quali21_9: LayoutBase = {
  name: "Qualification (21:9)",
  data: [
    {
      width: 67.5,
      height: 92.25,
      x: 0,
      y: 0,
      zIndex: 0,
      fillMode: "fill",
      window: {
        type: "main",
      },
    },
    {
      width: 32.499593098958336,
      height: 46,
      x: 67.5,
      y: 46.25,
      zIndex: 1,
      fillMode: "fill",
      window: {
        type: "driver-tracker",
      },
    },
    {
      width: 32.5,
      height: 43.875,
      x: 67.5,
      y: 2.25,
      zIndex: 2,
      fillMode: "fill",
      window: {
        type: "data-channel",
      },
    },
  ],
};

const quali16_10: LayoutBase = {
  name: "Qualification (16:10)",
  data: [
    {
      width: 46.125,
      height: 33.62358459147424,
      x: 12.375,
      y: 66.37641540852576,
      zIndex: 0,
      fillMode: "fill",
      window: {
        type: "data-channel",
      },
    },
    {
      width: 37,
      height: 33.62499999999999,
      x: 49.625,
      y: 66.375,
      zIndex: 1,
      fillMode: "fill",
      window: {
        type: "driver-tracker",
      },
    },
    {
      width: 74.25,
      height: 66.37433392539964,
      x: 12.375,
      y: 0.0006660746003596822,
      zIndex: 2,
      fillMode: "fill",
      window: {
        type: "main",
      },
    },
  ],
};

const fullScreen: LayoutBase = {
  name: "Full Screen",
  data: [
    {
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      zIndex: 0,
      fillMode: "fit",
      window: { type: "main" },
    },
  ],
};

const defaultLayouts: LayoutBase[] = [race16_10, race21_9, quali16_10, quali21_9, fullScreen];

const getLayout = (baseLayout: LayoutBase, mainId: string): WindowGridSavedLayout => {
  const layouts: GridLayout[] = [];
  const windows: GridWindow[] = [];

  for (const { window: w, ...layout } of baseLayout.data) {
    const id = w.type === "main" ? mainId : generateUID();
    const gridLayout: GridLayout = {
      id,
      ...layout,
    };
    const gridWindow: GridWindow = {
      id,
      ...w,
    };

    layouts.push(gridLayout);
    windows.push(gridWindow);
  }

  return {
    name: baseLayout.name,
    layout: layouts,
    windows,
  };
};

export const getDefaultState = (): WindowGridState => {
  const mainId = generateUID();

  return {
    currentLayoutIndex: 0,
    savedLayouts: defaultLayouts.map((layoutBase) => getLayout(layoutBase, mainId)),
  };
};
