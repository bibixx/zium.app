import { GridWindow } from "../../../../types/GridWindow";
import { Dimensions } from "../../../../types/Dimensions";
import { generateUID } from "../../../../utils/generateUID";
import { assertNever } from "../../../../utils/assertNever";
import { clone } from "../../../../utils/clone";
import { LocalStorageClient } from "../../../../utils/localStorageClient";
import { localStorageViewerStateValidator } from "./useViewerState.validator";

export type GridLayoutFillMode = "fit" | "fill";

export interface GridLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  zIndex: number;
  fillMode: GridLayoutFillMode;
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

interface UpdateFillModeAction {
  type: "updateFillMode";
  id: string;
  fillMode: GridLayoutFillMode;
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
  | UpdateFillModeAction
  | DeleteWindowAction
  | CreateWindowAction
  | LoadLayoutAction
  | RenameLayoutAction
  | DuplicateLayoutAction
  | DeleteLayoutAction;

export const STORE_LOCAL_STORAGE_KEY = "store";

export const storeLocalStorageClient = new LocalStorageClient(
  STORE_LOCAL_STORAGE_KEY,
  localStorageViewerStateValidator,
  getInitialState,
);

const withLocalStorage =
  (reducer: (prevState: WindowGridState, action: WindowGridActions) => WindowGridState) =>
  (prevState: WindowGridState, action: WindowGridActions) => {
    const newState = reducer(prevState, action);

    storeLocalStorageClient.set(newState);

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
    case "updateFillMode": {
      newCurrentLayout.layout = prevCurrentLayout.layout.map((l) => {
        if (l.id !== action.id) {
          return l;
        }

        return {
          ...l,
          fillMode: action.fillMode,
        };
      });

      break;
    }
    case "updateDimension": {
      newCurrentLayout.layout = prevCurrentLayout.layout.map((l) => {
        if (l.id !== action.id) {
          return l;
        }

        return {
          ...l,
          width: action.dimensions.width,
          height: action.dimensions.height,
          x: action.dimensions.x,
          y: action.dimensions.y,
          id: action.id,
        };
      });

      break;
    }
    case "updateWindow": {
      const newWindow = action.window;

      const indexOfReplacedWindow = prevCurrentLayout.windows.findIndex((w) => w.id === newWindow.id);
      const replacedWindow = prevCurrentLayout.windows[indexOfReplacedWindow];

      const oldWindowOfNewDriverIndex = prevCurrentLayout.windows.findIndex((w) => {
        if (w.type !== "driver" || newWindow.type !== "driver") {
          return w.type === newWindow.type;
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
        fillMode: "fill",
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

function getInitialState(): WindowGridState {
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
}

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
      fillMode: "fill",
    };
  });
};
