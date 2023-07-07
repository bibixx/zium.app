import { useReducer } from "react";
import { storeLocalStorageClient, windowGridReducerWithStorage } from "./useViewerState.utils";

export const useViewerState = () => {
  return useReducer(windowGridReducerWithStorage, storeLocalStorageClient.get());
};
