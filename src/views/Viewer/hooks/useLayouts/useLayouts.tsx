import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { WindowGridState } from "../useViewerState/useViewerState.utils";

const useLayoutsData = (): LayoutsContextType => {
  const [layouts, setLayoutsState] = useState<SavedLayout[]>(getInitialState());

  const setLayouts = useCallback(
    (newLayouts: SavedLayout[]) => {
      localStorage.setItem("store", JSON.stringify(newLayouts));
      localStorage.setItem("storeVersion", CURRENT_STORE_VERSION);
      setLayoutsState(newLayouts);
    },
    [setLayoutsState],
  );

  // Disabling rule to get this value only on the first render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initiallySelectedLayout = useMemo(() => layouts[getInitialSelectedLayoutIndex()], []);

  const updateLayoutAtIndex = useCallback(
    (updatedIndex: number, getNewLayout: (oldLayout: SavedLayout) => SavedLayout | null) => {
      const newLayouts = layouts
        .map((layout, i): SavedLayout | null => {
          if (updatedIndex !== i) {
            return layout;
          }

          return getNewLayout(layout);
        })
        .filter((layout): layout is SavedLayout => layout !== null);

      setLayouts(newLayouts);
    },
    [layouts, setLayouts],
  );

  const renameLayout = useCallback(
    (layoutIndex: number, name: string) => {
      updateLayoutAtIndex(layoutIndex, (oldLayout) => ({ ...oldLayout, name }));
    },
    [updateLayoutAtIndex],
  );

  const deleteLayout = useCallback(
    (layoutIndex: number) => {
      updateLayoutAtIndex(layoutIndex, () => null);
    },
    [updateLayoutAtIndex],
  );

  const saveLayout = useCallback(
    (name: string, layout: WindowGridState) => {
      const newLayout: SavedLayout = {
        name,
        layout,
      };
      setLayouts([...layouts, newLayout]);
    },
    [layouts, setLayouts],
  );

  const updateCurrentlySelectedIndex = useCallback((index: number) => {
    const indexToBeSaved = Math.max(0, index);
    localStorage.setItem("currentlySelectedIndex", JSON.stringify(indexToBeSaved));
    localStorage.setItem("storeVersion", CURRENT_STORE_VERSION);
  }, []);

  return {
    layouts,
    initiallySelectedLayout,
    updateCurrentlySelectedIndex,
    renameLayout,
    deleteLayout,
    saveLayout,
  };
};

interface SavedLayout {
  layout: WindowGridState;
  name: string;
}

const MAIN_ID = "__MAIN__";

const LAYOUT1: SavedLayout = {
  name: "21:9 (Race)",
  layout: {
    layout: [
      { width: 55.49967447916667, height: 76.49991461748868, x: 0, y: 0, id: MAIN_ID, zIndex: 6 },
      { width: 16.499837239583336, height: 23.5, x: 0, y: 76.5, id: "nlgk61", zIndex: 9 },
      { width: 17.999674161275223, height: 23.4990234375, x: 16.500323931376137, y: 76.5, id: "i1bglj", zIndex: 0 },
      { width: 22.499593098958336, height: 32.625, x: 55.500405629475914, y: 33.75, id: "jp4azy", zIndex: 8 },
      { width: 21.99951171875, height: 33.7490234375, x: 78.00024668375652, y: 0.0009765625, id: "3f7e9i", zIndex: 3 },
      { width: 21.999918619791668, height: 32.625, x: 77.99999872843425, y: 33.75, id: "ral762", zIndex: 2 },
      { width: 22.499593098958336, height: 33.75, x: 55.500405629475914, y: 0, id: "hp66b3", zIndex: 4 },
      { width: 22.499593098958336, height: 33.625, x: 55.500405629475914, y: 66.375, id: "1ziihg", zIndex: 7 },
      { width: 21.99951171875, height: 33.625, x: 77.99999872843425, y: 66.375, id: "u8dw0e", zIndex: 1 },
      { width: 20.999998728434242, height: 23.5, x: 34.50000127156576, y: 76.5, id: "u8dw0f", zIndex: 5 },
    ],
    windows: [
      { type: "main", id: MAIN_ID },
      { type: "driver-tracker", id: "nlgk61" },
      { type: "data-channel", id: "i1bglj" },
      {
        type: "driver",
        id: "jp4azy",
        driverId: "VER",
      },
      {
        type: "driver",
        id: "3f7e9i",
        driverId: "PER",
      },
      {
        type: "driver",
        id: "ral762",
        driverId: "HAM",
      },
      {
        type: "driver",
        id: "hp66b3",
        driverId: "LEC",
      },
      {
        type: "driver",
        id: "1ziihg",
        driverId: "SAI",
      },
      {
        type: "driver",
        id: "u8dw0e",
        driverId: "RUS",
      },
      {
        type: "driver",
        id: "u8dw0f",
        driverId: "MAG",
      },
    ],
  },
};

const LAYOUT2: SavedLayout = {
  name: "16:9 (Race)",
  layout: {
    layout: [
      {
        width: 60.75000000000001,
        height: 60.74950690335306,
        x: 0,
        y: 0,
        id: MAIN_ID,
        zIndex: 0,
      },
      {
        width: 36,
        height: 39.12182569033531,
        x: 0,
        y: 60.878174309664686,
        id: "i1bglj",
        zIndex: 3,
      },
      {
        width: 39.24956597222222,
        height: 51.749999999999986,
        x: 60.75000000000001,
        y: 0,
        id: "hp66b3",
        zIndex: 1,
      },
      {
        width: 39.24913194444444,
        height: 48.2481821876541,
        x: 60.75000000000001,
        y: 51.749999999999986,
        id: "u8dw0e",
        zIndex: 2,
      },
      {
        width: 24.75,
        height: 39.249722633136095,
        x: 36,
        y: 60.750000481539686,
        id: "o8opg9",
        zIndex: 4,
      },
    ],
    windows: [
      {
        type: "main",
        id: MAIN_ID,
      },
      {
        type: "data-channel",
        id: "i1bglj",
      },
      {
        type: "driver",
        id: "hp66b3",
        driverId: "VER",
      },
      {
        type: "driver",
        id: "u8dw0e",
        driverId: "PER",
      },
      {
        id: "o8opg9",
        type: "driver-tracker",
      },
    ],
  },
};

const LAYOUT3: SavedLayout = {
  name: "Layout 2",
  layout: {
    layout: [
      { id: MAIN_ID, width: 33.333333333333336, height: 33.333333333333336, y: 0, x: 0, zIndex: 0 },
      { id: "9rj4y4", width: 33.333333333333336, height: 33.333333333333336, y: 0, x: 66.66666666666667, zIndex: 2 },
      { id: "8hieec", width: 33.333333333333336, height: 33.333333333333336, y: 33.333333333333336, x: 0, zIndex: 3 },
      {
        width: 33.333333333333336,
        height: 33.33333333333334,
        x: 34.16666666666666,
        y: 36.41666666666667,
        id: "zwdcyx",
        zIndex: 4,
      },
    ],
    windows: [
      { type: "main", id: MAIN_ID },
      { type: "data-channel", id: "9rj4y4" },
      { type: "driver", id: "8hieec", driverId: "ALO" },
      { type: "driver", id: "zwdcyx", driverId: "LEC" },
    ],
  },
};

export const CURRENT_STORE_VERSION = "3";
const getInitialSelectedLayoutIndex = (): number => {
  const layoutsFromStorage = localStorage.getItem("currentlySelectedIndex") as string | null;
  const storeVersion = localStorage.getItem("storeVersion") as string | null;

  if (layoutsFromStorage != null && storeVersion === CURRENT_STORE_VERSION) {
    console.log(JSON.parse(layoutsFromStorage));

    return JSON.parse(layoutsFromStorage);
  }

  if (storeVersion !== CURRENT_STORE_VERSION) {
    localStorage.removeItem("currentlySelectedIndex");
    localStorage.removeItem("storeVersion");
  }

  return 0;
};

const getInitialState = (): SavedLayout[] => {
  const layoutsFromStorage = localStorage.getItem("store") as string | null;
  const storeVersion = localStorage.getItem("storeVersion") as string | null;

  if (layoutsFromStorage != null && storeVersion === CURRENT_STORE_VERSION) {
    return JSON.parse(layoutsFromStorage);
  }

  if (storeVersion !== CURRENT_STORE_VERSION) {
    localStorage.removeItem("store");
    localStorage.removeItem("storeVersion");
  }

  return [LAYOUT1, LAYOUT2, LAYOUT3];
};

export interface LayoutsContextType {
  initiallySelectedLayout: SavedLayout;
  layouts: SavedLayout[];
  renameLayout: (layoutIndex: number, name: string) => void;
  deleteLayout: (layoutIndex: number) => void;
  saveLayout: (name: string, layout: WindowGridState) => void;
  updateCurrentlySelectedIndex: (layoutIndex: number) => void;
}
export const LayoutsContext = createContext<LayoutsContextType | null>(null);
export const useLayouts = () => {
  const context = useContext(LayoutsContext);

  if (context === null) {
    throw new Error("Using uninitialised LayoutsContext");
  }

  return context;
};

interface LayoutsProviderProps {
  children: ReactNode;
}
export const LayoutsProvider = ({ children }: LayoutsProviderProps) => {
  const value = useLayoutsData();
  return <LayoutsContext.Provider value={value}>{children}</LayoutsContext.Provider>;
};
