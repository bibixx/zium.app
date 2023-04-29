import { useReducer } from "react";
import { useLayouts } from "../useLayouts/useLayouts";
import { windowGridReducer } from "./useViewerState.utils";

export const useViewerState = () => {
  const { initiallySelectedLayout } = useLayouts();
  return useReducer(windowGridReducer, initiallySelectedLayout.layout);
};
