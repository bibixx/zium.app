import { GridWindow } from "../../../../types/GridWindow";
import { Dimensions } from "../../../../types/Dimensions";
import { generateUID } from "../../../../utils/generateUID";
import { clone } from "../../../../utils/clone";

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

interface CreateWindowAction {
  type: "createWindow";
  window: GridWindow;
  dimensions: Dimensions;
}

interface DeleteWindowAction {
  type: "deleteWindow";
  windowId: string;
}

type WindowGridActions =
  | UpdateLayoutAction
  | UpdateWindowAction
  | BringToFrontAction
  | DeleteWindowAction
  | CreateWindowAction;

export const CURRENT_STORE_VERSION = "2";
export const windowGridReducer = (prevState: WindowGridState, action: WindowGridActions) => {
  const newState = clone(prevState);

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

      const indexOfReplacedWindow = prevState.windows.findIndex((w) => w.id === newWindow.id);
      const replacedWindow = prevState.windows[indexOfReplacedWindow];

      if (newWindow.type !== "driver" || replacedWindow.type !== "driver") {
        newState.windows.splice(indexOfReplacedWindow, 1, newWindow);
        break;
      }

      const oldWindowOfNewDriverIndex = prevState.windows.findIndex((w) => {
        if (w.type !== "driver" || newWindow.type !== "driver") {
          return false;
        }

        return w.driverId === newWindow.driverId;
      });
      const oldWindowOfNewDriver = prevState.windows[oldWindowOfNewDriverIndex];

      if (oldWindowOfNewDriver === undefined) {
        newState.windows.splice(indexOfReplacedWindow, 1, newWindow);
        break;
      }

      const replacedWindowLayoutIndex = prevState.layout.findIndex((l) => l.id === replacedWindow.id);
      const oldLayoutOfNewDriverIndex = prevState.layout.findIndex((l) => l.id === oldWindowOfNewDriver.id);

      newState.layout[replacedWindowLayoutIndex].id = oldWindowOfNewDriver.id;
      newState.layout[oldLayoutOfNewDriverIndex].id = replacedWindow.id;

      break;
    }
    case "createWindow": {
      const newWindow = action.window;
      const id = generateUID();
      newWindow.id = id;

      const layout: GridLayout = {
        id,
        ...action.dimensions,
        zIndex: 1,
      };

      newState.windows.push(newWindow);
      newState.layout.push(layout);
      newState.layout = windowGridReducer(newState, { type: "bringToFront", id }).layout;

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
