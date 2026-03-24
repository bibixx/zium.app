import { useCallback, useEffect, useRef, useState } from "react";
import { VideoPlayerRef } from "../../components/VideoPlayer/VideoPlayer.types";
import { Response } from "../../types/Response";
import { TimingSnapshot, WorkerOutMessage } from "./useLiveTimingData.types";

type LiveTimingDataState = Response<TimingSnapshot>;

const POLL_INTERVAL_MS = 500; // Poll video time at 2 Hz

export const useLiveTimingData = (
  sessionPath: string | null,
  isLive: boolean,
  mainVideoPlayer: VideoPlayerRef | null,
  offsetSeconds: number,
): LiveTimingDataState => {
  const [state, setState] = useState<LiveTimingDataState>({ state: "loading" });
  const workerRef = useRef<Worker | null>(null);
  const sessionStartUTCRef = useRef<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSeekElapsedRef = useRef<number>(-1);
  const offsetSecondsRef = useRef(offsetSeconds);
  offsetSecondsRef.current = offsetSeconds;

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current != null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Create and manage worker
  useEffect(() => {
    if (sessionPath == null) {
      setState({ state: "loading" });
      return;
    }

    const worker = new Worker(new URL("./useLiveTimingData.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.addEventListener("message", (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;

      switch (msg.type) {
        case "loading":
          setState({ state: "loading" });
          break;

        case "ready":
          sessionStartUTCRef.current = msg.sessionStartUTC;
          break;

        case "snapshot":
          setState({ state: "done", data: msg.data });
          break;

        case "error":
          console.error("[LiveTiming] Worker error:", msg.message);
          setState({ state: "error", error: new Error(msg.message) });
          break;
      }
    });

    worker.addEventListener("error", (event) => {
      console.error("[LiveTiming] Worker uncaught error:", event.message, event);
    });

    worker.postMessage({ type: "load", sessionPath, isLive });

    return () => {
      worker.postMessage({ type: "destroy" });
      worker.terminate();
      workerRef.current = null;
      stopPolling();
    };
  }, [sessionPath, isLive, stopPolling]);

  // Poll video time and send seek messages to worker (replay mode only)
  useEffect(() => {
    if (isLive || workerRef.current == null || mainVideoPlayer == null) {
      return;
    }

    const poll = () => {
      const worker = workerRef.current;
      if (worker == null || mainVideoPlayer == null) {
        return;
      }

      const playheadDate = mainVideoPlayer.player.getPlayheadTimeAsDate();
      if (playheadDate == null || sessionStartUTCRef.current === 0) {
        return;
      }

      const elapsedMs = playheadDate.getTime() - sessionStartUTCRef.current - offsetSecondsRef.current * 1000;

      // Only seek if elapsed time changed by at least 200ms to avoid redundant work
      if (elapsedMs >= 0 && Math.abs(elapsedMs - lastSeekElapsedRef.current) >= 200) {
        lastSeekElapsedRef.current = elapsedMs;
        worker.postMessage({ type: "seek", elapsedMs });
      }
    };

    // Poll immediately and then at interval
    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return stopPolling;
  }, [isLive, mainVideoPlayer, stopPolling]);

  return state;
};
