import "signalr";
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $: any;
  }
}

import { useEffect, useMemo } from "react";
import { useStore } from "zustand";
import { MessagingClient } from "../../utils/messagingClient";
import { TimingStoreApi } from "../useTiming/useTiming";
import { PageToWorkerContract } from "./worker/timingData.contract";

/*
const USE_REPLAY = false;
/*/
const USE_REPLAY = true;
//*/

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
    if (USE_REPLAY) {
      worker.makeContractualRequest("setupSocketConnection", undefined);
      return;
    }

    const onReceived = async function (data: unknown) {
      const dataRange = await worker.makeContractualRequest("pushDataLine", data);
      if (dataRange == null) {
        return;
      }

      setDataRange(dataRange);
      setCurrentTime(dataRange.start);
    };

    const $ = window.$;

    const connection = $.hubConnection();

    connection.logging = true;

    connection.qs = { version: "1.5" };
    connection.url = "https://livetiming.formula1.com/signalr";
    const streamingHub = connection.createHubProxy("Streaming");

    connection.received(onReceived);

    connection.start().done(function () {
      streamingHub.invoke("Subscribe", [
        "Heartbeat",
        "CarData.z",
        "Position.z",
        "ExtrapolatedClock",
        "TopThree",
        "RcmSeries", // still used?
        "TimingStats",
        "TimingAppData",
        "WeatherData",
        "TrackStatus",
        "DriverList",
        "RaceControlMessages",
        "SessionInfo",
        "SessionData",
        "LapCount",
        "TimingData",
        "TeamRadio",
      ]);
    });

    return () => connection.stop();
  }, [setCurrentTime, setDataRange, worker]);

  useEffect(() => {
    worker.handleContractualRequest("pushDataRange", (dataRange) => {
      setDataRange(dataRange);
      setCurrentTime(dataRange.start);
    });
  }, [setCurrentTime, setDataRange, worker]);

  useEffect(() => {
    (async () => {
      if (dataRange === null) {
        return;
      }

      const value = await worker.makeContractualRequest("getData", currentTime);
      if (value != null) {
        setData(value);
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
