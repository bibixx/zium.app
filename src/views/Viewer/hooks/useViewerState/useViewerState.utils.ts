import { GridWindow } from "../../../../types/GridWindow";
import { Dimensions } from "../../../../types/Dimensions";
import { generateUID } from "../../../../utils/generateUID";
import { assertNever } from "../../../../utils/assertNever";
import { clone } from "../../../../utils/clone";

interface GridLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  zIndex: number;
}

export interface WindowGridSavedLayout {
  name: string;
  layout: GridLayout[];
  windows: GridWindow[];
}

export interface WindowGridState {
  savedLayouts: WindowGridSavedLayout[];
  currentLayoutIndex: number;
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

interface LoadLayoutAction {
  type: "loadLayout";
  layoutIndex: number;
}

interface DuplicateLayoutAction {
  type: "duplicateLayout";
  sourceLayoutIndex: number;
  name: string;
}

interface RenameLayoutAction {
  type: "renameLayout";
  layoutIndex: number;
  name: string;
}

interface DeleteLayoutAction {
  type: "deleteLayout";
  layoutIndex: number;
}

type WindowGridActions =
  | UpdateLayoutAction
  | UpdateWindowAction
  | BringToFrontAction
  | DeleteWindowAction
  | CreateWindowAction
  | LoadLayoutAction
  | RenameLayoutAction
  | DuplicateLayoutAction
  | DeleteLayoutAction;

export const CURRENT_STORE_VERSION = "3";
const withLocalStorage =
  (reducer: (prevState: WindowGridState, action: WindowGridActions) => WindowGridState) =>
  (prevState: WindowGridState, action: WindowGridActions) => {
    const newState = reducer(prevState, action);

    localStorage.setItem("store", JSON.stringify(newState));
    localStorage.setItem("storeVersion", CURRENT_STORE_VERSION);

    return newState;
  };

export const windowGridReducer = (prevState: WindowGridState, action: WindowGridActions) => {
  const newState = clone(prevState);
  const currentLayoutIndex = prevState.currentLayoutIndex;
  const prevCurrentLayout = prevState.savedLayouts[currentLayoutIndex];
  const newCurrentLayout = newState.savedLayouts[currentLayoutIndex];

  if (action.type === "deleteLayout") {
    if (newState.savedLayouts.length === 1) {
      return newState;
    }

    newState.savedLayouts.splice(action.layoutIndex, 1);
    newState.currentLayoutIndex = Math.min(action.layoutIndex, newState.savedLayouts.length - 1);

    return newState;
  }

  switch (action.type) {
    case "bringToFront": {
      const sortedLayoutByZIndex = prevCurrentLayout.layout
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

      newCurrentLayout.layout = prevCurrentLayout.layout.map((l) => ({
        ...l,
        zIndex: sortedLayoutByZIndex.indexOf(l.id),
      }));

      break;
    }
    case "updateDimension": {
      newCurrentLayout.layout = prevCurrentLayout.layout.map((l) => {
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

      const indexOfReplacedWindow = prevCurrentLayout.windows.findIndex((w) => w.id === newWindow.id);
      const replacedWindow = prevCurrentLayout.windows[indexOfReplacedWindow];

      if (newWindow.type !== "driver" || replacedWindow.type !== "driver") {
        newCurrentLayout.windows.splice(indexOfReplacedWindow, 1, newWindow);
        break;
      }

      const oldWindowOfNewDriverIndex = prevCurrentLayout.windows.findIndex((w) => {
        if (w.type !== "driver" || newWindow.type !== "driver") {
          return false;
        }

        return w.driverId === newWindow.driverId;
      });
      const oldWindowOfNewDriver = prevCurrentLayout.windows[oldWindowOfNewDriverIndex];

      if (oldWindowOfNewDriver === undefined) {
        newCurrentLayout.windows.splice(indexOfReplacedWindow, 1, newWindow);
        break;
      }

      const replacedWindowLayoutIndex = prevCurrentLayout.layout.findIndex((l) => l.id === replacedWindow.id);
      const oldLayoutOfNewDriverIndex = prevCurrentLayout.layout.findIndex((l) => l.id === oldWindowOfNewDriver.id);

      newCurrentLayout.layout[replacedWindowLayoutIndex].id = oldWindowOfNewDriver.id;
      newCurrentLayout.layout[oldLayoutOfNewDriverIndex].id = replacedWindow.id;

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

      newCurrentLayout.windows.push(newWindow);
      newCurrentLayout.layout.push(layout);
      newCurrentLayout.layout = windowGridReducer(newState, { type: "bringToFront", id }).savedLayouts[
        currentLayoutIndex
      ].layout;

      break;
    }
    case "deleteWindow": {
      newCurrentLayout.windows = newCurrentLayout.windows.filter((w) => w.id !== action.windowId);
      newCurrentLayout.layout = newCurrentLayout.layout.filter((w) => w.id !== action.windowId);

      break;
    }
    case "loadLayout": {
      newState.currentLayoutIndex = action.layoutIndex;

      break;
    }
    case "duplicateLayout": {
      const sourceLayout = newState.savedLayouts[action.sourceLayoutIndex];
      const newLayout = structuredClone(sourceLayout);
      newLayout.name = action.name;

      newState.savedLayouts.push(newLayout);
      newState.currentLayoutIndex = newState.savedLayouts.length - 1;

      break;
    }
    case "renameLayout": {
      if (action.layoutIndex === currentLayoutIndex) {
        newCurrentLayout.name = action.name;
      } else {
        const sourceLayout = newState.savedLayouts[action.layoutIndex];
        const newLayout = structuredClone(sourceLayout);
        newLayout.name = action.name;
        newState.savedLayouts.splice(action.layoutIndex, 1, newLayout);
      }

      break;
    }
    default: {
      assertNever(action);
    }
  }

  newState.savedLayouts.splice(currentLayoutIndex, 1, newCurrentLayout);

  return newState;
};

export const windowGridReducerWithStorage = withLocalStorage(windowGridReducer);

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
    currentLayoutIndex: 0,
    savedLayouts: [
      {
        name: "Layout 1",
        layout: getInitialLayout(windows),
        windows,
      },
    ],
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
