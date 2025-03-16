import { useEffect } from "react";
import { useDataStore, usePositionStore, useCarDataStore } from "../useStores/useDataStore";
import { useSettingsStore } from "../useStores/useSettingsStore";
import { LIVE_TIMING_DEBUG_DATA } from "./useSetupLiveTiming.debugData";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSetupRealLiveTiming = () => {
  useEffect(() => {
    const worker = new Worker(new URL("./worker/connectLiveTiming.worker.ts", import.meta.url), {
      type: "module",
    });

    useSettingsStore.subscribe(
      (state) => state.delay,
      (delay) => worker.postMessage({ type: "setDelay", payload: delay }),
      { fireImmediately: true },
    );

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case "updateState":
          useDataStore.getState().set(payload);
          break;
        case "updatePosition":
          usePositionStore.getState().set(payload);
          break;
        case "updateCarData":
          useCarDataStore.getState().set(payload);
          break;
        default:
          console.warn("Unknown message type from worker:", type);
      }
    };

    // Initialize the worker
    worker.postMessage({ type: "init" });

    return () => {
      worker.postMessage({ type: "cleanup" });
      worker.terminate();
    };
  }, []);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSetupDebugLiveTiming = () => {
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    useDataStore.getState().set(LIVE_TIMING_DEBUG_DATA.useDataStore as any);
    usePositionStore.getState().set(LIVE_TIMING_DEBUG_DATA.usePositionStore.positions);
    useCarDataStore.getState().set(LIVE_TIMING_DEBUG_DATA.useCarDataStore.carsData);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, []);
};

// /*
export const useSetupLiveTiming = useSetupRealLiveTiming;
/*/
export const useSetupLiveTiming = useSetupDebugLiveTiming;
//*/
