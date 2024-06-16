import { createContext, useCallback, useContext, useRef } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { useTimingData } from "../useTimingData/useTimingData";
import { TimingRoot } from "../useTimingData/useTimingData.validator";

type DoneState = {
  status: "done";
  data: TimingRoot | null;
  dataRange: { start: number; end: number } | null;
  currentTime: number;
};
type State = { state: DoneState };

type Action = {
  setData: (state: DoneState["data"]) => void;
  setDataRange: (state: DoneState["dataRange"]) => void;
  setCurrentTime: (state: DoneState["currentTime"]) => void;
};

type TimingStoreValues = State & Action;
export type TimingStoreApi = StoreApi<TimingStoreValues>;
const TimingContext = createContext<TimingStoreApi | null>(null);

interface TimingProviderProps {
  children: React.ReactNode;
}
export const TimingProvider = ({ children }: TimingProviderProps) => {
  const storeRef = useRef<TimingStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createStore<TimingStoreValues>((set) => ({
      state: { status: "done", data: null, dataRange: null, currentTime: Date.now() },
      setData: (data) => set((prevState) => ({ state: { ...prevState.state, data } })),
      setDataRange: (dataRange) => set((prevState) => ({ state: { ...prevState.state, dataRange } })),
      setCurrentTime: (currentTime) => set((prevState) => ({ state: { ...prevState.state, currentTime } })),
    }));
  }

  useTimingData(storeRef.current);
  return <TimingContext.Provider value={storeRef.current}>{children}</TimingContext.Provider>;
};

export const useTimingStoreApiRef = () => {
  return useContext(TimingContext);
};

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;
export function useTiming<U>(selector: (state: ExtractState<TimingStoreApi>) => U) {
  const store = useContext(TimingContext);

  if (store === null) {
    throw new Error("useTiming must be used within a TimingProvider");
  }

  return useStore(store, selector);
}
export function useLoadedTimingData<U>(selector: (state: Exclude<DoneState["data"], null>) => U) {
  const store = useContext(TimingContext);

  const baseSelector = useCallback(
    (s: State) => {
      if (s.state.data == null) {
        throw new Error("useLoadedTiming must be used with a loaded state");
      }

      return selector(s.state.data);
    },
    [selector],
  );

  if (store === null) {
    throw new Error("useTiming must be used within a TimingProvider");
  }

  return useStore(store, baseSelector);
}
