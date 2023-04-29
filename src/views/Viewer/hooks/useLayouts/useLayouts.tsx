import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { WindowGridState } from "../useViewerState/useViewerState.utils";

export const useLayouts = () => {
  const [layouts, setLayouts] = useState<SavedLayout[]>([LAYOUT1, LAYOUT2, LAYOUT3]);

  // Disabling rule to get this value only on the first render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initiallySelectedLayout = useMemo(() => layouts[INITIAL_SELECTED_LAYOUT_INDEX], []);

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
    [layouts],
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
    [layouts],
  );

  return { layouts, initiallySelectedLayout, renameLayout, deleteLayout, saveLayout };
};

interface SavedLayout {
  layout: WindowGridState;
  name: string;
}

const INITIAL_SELECTED_LAYOUT_INDEX = 1;

const LAYOUT1: SavedLayout = {
  name: "Layout 1",
  layout: {
    layout: [
      { width: 55.49967447916667, height: 76.49991461748868, x: 0, y: 0, id: "b1rfqr", zIndex: 5 },
      { width: 16.499837239583336, height: 23.5, x: 0, y: 76.5, id: "nlgk61", zIndex: 7 },
      { width: 17.999674161275223, height: 23.4990234375, x: 16.500323931376137, y: 76.5, id: "i1bglj", zIndex: 0 },
      {
        width: 22.499593098958336,
        height: 32.625,
        x: 55.500406901041664,
        y: 33.750003814697266,
        id: "jp4azy",
        zIndex: 8,
      },
      { width: 21.99951171875, height: 33.7490234375, x: 78.00024668375652, y: 0.0009765625, id: "3f7e9i", zIndex: 2 },
      { width: 21.999918619791668, height: 32.625, x: 78.00008138020833, y: 33.75, id: "ral762", zIndex: 9 },
      { width: 22.499593098958336, height: 33.75, x: 55.500405629475914, y: 0, id: "hp66b3", zIndex: 3 },
      { width: 22.499593098958336, height: 33.625, x: 55.500405629475914, y: 66.375, id: "1ziihg", zIndex: 6 },
      { width: 21.99951171875, height: 33.625, x: 77.99999872843425, y: 66.375, id: "u8dw0e", zIndex: 1 },
      { width: 20.999998728434242, height: 23.5, x: 34.50000127156576, y: 76.5, id: "u8dw0f", zIndex: 4 },
    ],
    windows: [
      { type: "main", id: "b1rfqr" },
      { type: "driver-tracker", id: "nlgk61" },
      { type: "data-channel", id: "i1bglj" },
      { type: "driver", id: "jp4azy", driverId: "VER" },
      { type: "driver", id: "3f7e9i", driverId: "PER" },
      { type: "driver", id: "ral762", driverId: "HAM" },
      { type: "driver", id: "hp66b3", driverId: "LEC" },
      { type: "driver", id: "1ziihg", driverId: "SAI" },
      { type: "driver", id: "u8dw0e", driverId: "RUS" },
      { type: "driver", id: "u8dw0f", driverId: "ALO" },
    ],
  },
};

const LAYOUT2: SavedLayout = {
  name: "Layout 2",
  layout: {
    layout: [
      { id: "4g6r3x", width: 33.333333333333336, height: 33.333333333333336, y: 0, x: 0, zIndex: 0 },
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
      { type: "main", id: "4g6r3x" },
      { type: "data-channel", id: "9rj4y4" },
      { type: "driver", id: "8hieec", driverId: "ALO" },
      { type: "driver", id: "zwdcyx", driverId: "LEC" },
    ],
  },
};

const LAYOUT3: SavedLayout = {
  name: "layout3",
  layout: {
    layout: [
      { width: 55.49967447916667, height: 76.49991461748868, x: 0, y: 0, id: "b1rfqr", zIndex: 6 },
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
      { type: "main", id: "b1rfqr" },
      { type: "driver-tracker", id: "nlgk61" },
      { type: "data-channel", id: "i1bglj" },
      { type: "driver", id: "jp4azy", driverId: "VER" },
      { type: "driver", id: "3f7e9i", driverId: "PER" },
      { type: "driver", id: "ral762", driverId: "HAM" },
      { type: "driver", id: "hp66b3", driverId: "LEC" },
      { type: "driver", id: "1ziihg", driverId: "SAI" },
      { type: "driver", id: "u8dw0e", driverId: "RUS" },
      { type: "driver", id: "u8dw0f", driverId: "MAG" },
    ],
  },
};

export interface LayoutsContextType {
  layouts: SavedLayout[];
  renameLayout: (layoutIndex: number, name: string) => void;
  deleteLayout: (layoutIndex: number) => void;
  saveLayout: (name: string, layout: WindowGridState) => void;
  loadLayout: (layout: WindowGridState) => void;
}
export const LayoutsContext = createContext<LayoutsContextType | null>(null);
export const useLayoutsContext = () => {
  const context = useContext(LayoutsContext);

  if (context === null) {
    throw new Error("Using uninitialised LayoutsContext");
  }

  return context;
};

interface LayoutsProviderProps {
  children: ReactNode;
  context: LayoutsContextType;
}
export const LayoutsProvider = ({ children, context }: LayoutsProviderProps) => {
  return <LayoutsContext.Provider value={context}>{children}</LayoutsContext.Provider>;
};
