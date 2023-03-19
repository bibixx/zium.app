import { useReducer } from "react";
import { getInitialState, windowGridReducer } from "./useViewerState.utils";

export const useViewerState = () => {
  return useReducer(windowGridReducer, getInitialState());
};
