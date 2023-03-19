import { GridWindow } from "../../../../types/GridWindow";
import { Dimensions } from "../../../../types/Dimensions";
import { generateUID } from "../../../../utils/generateUID";

interface GridLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  zIndex: number;
}

export interface WindowGridState {
  layout: GridLayout[];
  windows: GridWindow[];
}

interface UpdateLayoutAction {
  type: "updateDimension";
  dimensions: Dimensions;
  id: string;
}

interface BringToFrontAction {
  type: "bringToFront";
  id: string;
}

interface UpdateWindowAction {
  type: "updateWindow";
  window: GridWindow;
}

interface DeleteWindowAction {
  type: "deleteWindow";
  windowId: string;
}

type WindowGridActions = UpdateLayoutAction | UpdateWindowAction | BringToFrontAction | DeleteWindowAction;

export const CURRENT_STORE_VERSION = "2";
export const windowGridReducer = (prevState: WindowGridState, action: WindowGridActions) => {
  const newState = structuredClone(prevState) as WindowGridState;

  switch (action.type) {
    case "bringToFront": {
      const sortedLayoutByZIndex = [...prevState.layout]
        .sort((a, b) => {
          if (a.id === action.id) {
            return 1;
          }

          if (b.id === action.id) {
            return -1;
          }

          return a.zIndex - b.zIndex;
        })
        .map((l) => l.id);

      newState.layout = prevState.layout.map((l) => ({
        ...l,
        zIndex: sortedLayoutByZIndex.indexOf(l.id),
      }));

      break;
    }
    case "updateDimension": {
      newState.layout = prevState.layout.map((l) => {
        if (l.id !== action.id) {
          return l;
        }

        return {
          width: action.dimensions.width,
          height: action.dimensions.height,
          x: action.dimensions.x,
          y: action.dimensions.y,
          id: action.id,
          zIndex: l.zIndex,
        };
      });

      break;
    }
    case "updateWindow": {
      const newWindow = action.window;

      const oldUpdatedVideo = newState.windows.find((w) => w.id === newWindow.id);

      newState.windows = newState.windows.map((w) => {
        if (w.id === newWindow.id) {
          return newWindow;
        }

        if (
          oldUpdatedVideo?.type === "driver" &&
          newWindow.type === "driver" &&
          w.type === "driver" &&
          newWindow.driverId === w.driverId
        ) {
          return {
            driverId: oldUpdatedVideo.driverId,
            type: oldUpdatedVideo.type,
            id: w.id,
          };
        }

        return w;
      });

      break;
    }
    case "deleteWindow": {
      newState.windows = newState.windows.filter((w) => w.id !== action.windowId);
      newState.layout = newState.layout.filter((w) => w.id !== action.windowId);

      break;
    }
  }

  localStorage.setItem("store", JSON.stringify(newState));
  localStorage.setItem("storeVersion", CURRENT_STORE_VERSION);

  return newState;
};

export const getInitialState = (): WindowGridState => {
  const layoutFromStorage = localStorage.getItem("store") as string | null;
  const storeVersion = localStorage.getItem("storeVersion") as string | null;

  if (layoutFromStorage != null && storeVersion === CURRENT_STORE_VERSION) {
    return JSON.parse(layoutFromStorage);
  }

  if (storeVersion !== CURRENT_STORE_VERSION) {
    localStorage.removeItem("store");
    localStorage.removeItem("storeVersion");
  }

  const windows: GridWindow[] = [
    {
      type: "main",
      id: generateUID(),
    },
    {
      type: "driver-tracker",
      id: generateUID(),
    },
    {
      type: "data-channel",
      id: generateUID(),
    },
    {
      type: "driver",
      id: generateUID(),
      driverId: "ALO",
    },
    {
      type: "driver",
      id: generateUID(),
      driverId: "LEC",
    },
    // {
    //   type: "driver",
    //   id: generateUID(),
    //   driverId: "PER",
    // },
    // {
    //   type: "driver",
    //   id: generateUID(),
    //   driverId: "RIC",
    // },
  ];

  return {
    layout: getInitialLayout(windows),
    windows,
  };
};

const getInitialLayout = (windows: GridWindow[]): GridLayout[] => {
  const columns = Math.ceil(Math.sqrt(windows.length));
  const rows = Math.ceil(Math.sqrt(windows.length));

  const columnWidth = 100 / columns;
  const rowHeight = 100 / rows;

  return windows.map((w, i): GridLayout => {
    const column = i % columns;
    const row = Math.floor(i / columns);

    return {
      id: w.id,
      width: columnWidth,
      height: rowHeight,
      y: row * rowHeight,
      x: column * columnWidth,
      zIndex: i + 1,
    };
  });
};
