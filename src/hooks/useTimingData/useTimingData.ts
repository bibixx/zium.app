import { useEffect, useMemo } from "react";
import { useStore } from "zustand";
import { MessagingClient } from "../../utils/messagingClient";
import { TimingStoreApi } from "../useTiming/useTiming";
import { PageToWorkerContract } from "./worker/timingData.contract";
import { TimingRoot } from "./useTimingData.validator";

const workerURL = new URL("./worker/timingData.worker.ts", import.meta.url);
export const useTimingData = (store: TimingStoreApi) => {
  const data = useStore(store, (store) => store.state.data);
  const setData = useStore(store, (store) => store.setData);

  const currentTime = useStore(store, (store) => store.state.currentTime);
  const setCurrentTime = useStore(store, (store) => store.setCurrentTime);

  const dataRange = useStore(store, (store) => store.state.dataRange);
  const setDataRange = useStore(store, (store) => store.setDataRange);

  const worker = useMemo(() => {
    const w = new Worker(workerURL, { type: "module" });
    return new MessagingClient<PageToWorkerContract>(w, "page-to-worker", "worker-to-page", false);
  }, []);

  useEffect(() => {
    worker.makeContractualRequest("setupSocketConnection", undefined);

    let wasSet = false;
    worker.handleContractualRequest("pushDataRange", (dataRange) => {
      setDataRange(dataRange);

      if (!wasSet) {
        setCurrentTime(dataRange.start);
        wasSet = true;
      }
    });

    return () => {
      worker.makeContractualRequest("destroySocketConnection", undefined);
    };
  }, [setCurrentTime, setDataRange, worker]);

  useEffect(() => {
    (async () => {
      if (dataRange === null) {
        return;
      }

      const value = await worker.makeContractualRequest("getData", currentTime);
      if (value != null) {
        setData(value as unknown as TimingRoot);
      }
    })();
  }, [currentTime, dataRange, setData, worker]);

  return {
    data,
    dataRange,
    currentTime,
    setCurrentTime,
  };
};
