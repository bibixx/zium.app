import { useReducer } from "react";
import { getInitialState, windowGridReducer, WindowGridState } from "./useViewerState.utils";

export const useViewerState = (initialState: WindowGridState) => {
  return useReducer(windowGridReducer, initialState);
};
