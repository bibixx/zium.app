import { GridWindow } from "../types/GridWindow";
import { Dimensions } from "../types/Dimensions";
import { generateUID } from "./generateUID";

interface GridLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  zIndex: number;
}

interface WindowGridState {
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

type WindowGridActions = UpdateLayoutAction | UpdateWindowAction | BringToFrontAction;

const CURRENT_STORE_VERSION = "2";
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
          newWindow.streamIdentifier === w.streamIdentifier
        ) {
          return {
            color: oldUpdatedVideo.color,
            firstName: oldUpdatedVideo.firstName,
            lastName: oldUpdatedVideo.lastName,
            streamIdentifier: oldUpdatedVideo.streamIdentifier,
            team: oldUpdatedVideo.team,
            type: oldUpdatedVideo.type,
            url: oldUpdatedVideo.url,
            id: w.id,
          };
        }

        return w;
      });

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
      url: "",
    },
    {
      type: "driver-tracker",
      id: generateUID(),
      url: "",
    },
    {
      type: "data-channel",
      id: generateUID(),
      url: "",
    },
    {
      type: "driver",
      id: generateUID(),
      firstName: "",
      lastName: "",
      url: "",
      team: "",
      color: "",
      streamIdentifier: "VER",
    },
    {
      type: "driver",
      id: generateUID(),
      firstName: "",
      lastName: "",
      url: "",
      team: "",
      color: "",
      streamIdentifier: "LEC",
    },
    {
      type: "driver",
      id: generateUID(),
      firstName: "",
      lastName: "",
      url: "",
      team: "",
      color: "",
      streamIdentifier: "PER",
    },
  ];

  return {
    layout: [
      { width: 48, height: 30, x: 0, y: 0, id: windows[0].id, zIndex: 1 },
      { width: 48, height: 30, x: 48, y: 0, id: windows[1].id, zIndex: 2 },
      { width: 48, height: 30, x: 0, y: 30, id: windows[2].id, zIndex: 3 },
      { width: 48, height: 30, x: 48, y: 30, id: windows[3].id, zIndex: 4 },
      { width: 48, height: 30, x: 0, y: 60, id: windows[4].id, zIndex: 5 },
      { width: 48, height: 30, x: 48, y: 60, id: windows[5].id, zIndex: 6 },
    ],
    windows,
  };
};
