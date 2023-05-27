import { useReducer } from "react";
import { getInitialState, windowGridReducerWithStorage } from "./useViewerState.utils";

export const useViewerState = () => {
  return useReducer(windowGridReducerWithStorage, getInitialState());
};
