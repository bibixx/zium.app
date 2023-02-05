import type { Layout as GridLayout } from "react-grid-layout";
import { GridWindow } from "../types/GridWindow";
import { generateUID } from "./generateUID";

interface WindowGridState {
  layout: GridLayout[];
  windows: GridWindow[];
}

interface UpdateLayoutAction {
  type: "updateLayout";
  layout: GridLayout[];
}

interface UpdateWindowAction {
  type: "updateWindow";
  window: GridWindow;
}

type WindowGridActions = UpdateLayoutAction | UpdateWindowAction;

export const windowGridReducer = (
  prevState: WindowGridState,
  action: WindowGridActions,
) => {
  const newState = structuredClone(prevState) as WindowGridState;

  switch (action.type) {
    case "updateLayout": {
      newState.layout = action.layout;
      break;
    }
    case "updateWindow": {
      const newWindow = action.window;
      const windowToBeUpdatedIndex = newState.windows.findIndex(
        (w) => w.id === newWindow.id,
      );

      newState.windows.splice(windowToBeUpdatedIndex, 1, newWindow);

      break;
    }
  }

  localStorage.setItem("store", JSON.stringify(newState));

  return newState;
};

export const getInitialState = (): WindowGridState => {
  const layoutFromStorage = localStorage.getItem("store") as string | null;

  if (layoutFromStorage != null) {
    return JSON.parse(layoutFromStorage);
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
      { w: 67, h: 67, x: 0, y: 0, i: windows[0].id },
      { w: 34, h: 33, x: 0, y: 67, i: windows[1].id },
      { w: 33, h: 33, x: 34, y: 67, i: windows[2].id },
      { w: 33, h: 34, x: 67, y: 0, i: windows[3].id },
      { w: 33, h: 33, x: 67, y: 34, i: windows[4].id },
      { w: 33, h: 33, x: 67, y: 67, i: windows[5].id },
    ],
    windows,
  };
};
