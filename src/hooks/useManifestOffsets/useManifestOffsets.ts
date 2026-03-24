import { MutableRefObject, useEffect, useRef } from "react";
import { VideoPlayerRef } from "../../components/VideoPlayer/VideoPlayer.types";
import { GridWindow, MainGridWindow } from "../../types/GridWindow";

export type ManifestOffsets = Record<string, number>;

interface UseManifestOffsetsArguments {
  windows: GridWindow[];
  windowPlayerRefMapRef: MutableRefObject<Record<string, VideoPlayerRef | null>>;
}

/**
 * Computes stream offsets from HLS manifest #EXT-X-PROGRAM-DATE-TIME tags.
 *
 * Each F1 TV HLS playlist embeds absolute wall-clock timestamps per segment.
 * By comparing `player.getPresentationStartTimeAsDate()` across streams,
 * we get the exact time offset between them — no backend needed.
 *
 * Returns a ref containing offsets in seconds, keyed by window ID,
 * relative to the main window (positive = stream starts later = behind main).
 */
export const useManifestOffsets = ({ windows, windowPlayerRefMapRef }: UseManifestOffsetsArguments) => {
  const manifestOffsetsRef = useRef<ManifestOffsets>({});
  const presentationStartTimesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const mainWindow = windows.find((w): w is MainGridWindow => w.type === "main");
    if (mainWindow == null) return;

    const computeOffsets = () => {
      const startTimes = presentationStartTimesRef.current;

      for (const w of windows) {
        if (startTimes[w.id] != null) continue;

        const playerRef = windowPlayerRefMapRef.current[w.id];
        if (playerRef == null) continue;

        const presentationStartDate = playerRef.player.getPresentationStartTimeAsDate();
        if (presentationStartDate == null) continue;

        startTimes[w.id] = presentationStartDate.getTime();
      }

      const mainStartTime = startTimes[mainWindow.id];
      if (mainStartTime == null) return;

      const offsets: ManifestOffsets = {};
      for (const w of windows) {
        if (w.id === mainWindow.id) continue;

        const windowStartTime = startTimes[w.id];
        if (windowStartTime == null) continue;

        // Positive offset = this stream's presentation starts later than main
        // (i.e., at the same wall-clock moment, this stream is "behind" in content)
        offsets[w.id] = (windowStartTime - mainStartTime) / 1000;
      }

      manifestOffsetsRef.current = offsets;
    };

    const pollInterval = window.setInterval(computeOffsets, 500);
    computeOffsets();

    return () => {
      window.clearInterval(pollInterval);
      manifestOffsetsRef.current = {};
      presentationStartTimesRef.current = {};
    };
  }, [windows, windowPlayerRefMapRef]);

  return { manifestOffsetsRef, presentationStartTimesRef };
};
