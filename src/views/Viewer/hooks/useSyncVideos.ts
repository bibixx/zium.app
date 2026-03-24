import { MutableRefObject, useEffect, useRef } from "react";
import { PlaybackOffsets } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridWindow, MainGridWindow } from "../../../types/GridWindow";
import { UserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { VideoPlayerRef } from "../../../components/VideoPlayer/VideoPlayer.types";
import { ManifestOffsets, useManifestOffsets } from "../../../hooks/useManifestOffsets/useManifestOffsets";

// Drift thresholds (in seconds)
const DRIFT_IGNORE_THRESHOLD = 0.05; // < 50ms — imperceptible
const DRIFT_HARD_SEEK_THRESHOLD = 0.3; // > 300ms — too far for rate correction
const RATE_CORRECTION_FAST = 1.03;
const RATE_CORRECTION_SLOW = 0.97;

export interface SyncWindowState {
  windowId: string;
  driftMs: number;
  playbackRate: number;
}

export type SyncStateSnapshot = SyncWindowState[];

interface UseSyncVideosArguments {
  windows: GridWindow[];
  windowPlayerRefMapRef: MutableRefObject<Record<string, VideoPlayerRef | null>>;
  isLive: boolean;
  playbackOffsets: PlaybackOffsets;
}

const supportsRVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;

export const useSyncVideos = ({ windows, windowPlayerRefMapRef, isLive, playbackOffsets }: UseSyncVideosArguments) => {
  const { offsets: userOffsetsRef, offsetEmitter } = useUserOffsets();
  const syncStateRef = useRef<SyncStateSnapshot>([]);
  const { manifestOffsetsRef, presentationStartTimesRef } = useManifestOffsets({ windows, windowPlayerRefMapRef });

  useEffect(() => {
    const mainWindow = windows.find((w): w is MainGridWindow => w.type === "main");
    if (mainWindow == null) return;

    // Shared master time — updated every frame by the master's rVFC callback
    let masterTime = 0;
    let masterSeekRangeEnd = 0;
    let masterTimeShift = 0; // for live: distance from live edge

    // --- Play/pause sync (runs periodically) ---
    const syncPlayPause = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return;

      const mainVideo = mainRef.video;
      const isMainPlaying = !mainVideo.paused && !mainVideo.ended;

      windows.forEach((w) => {
        if (w.id === mainWindow.id) return;
        const playerRef = windowPlayerRefMapRef.current[w.id];
        if (playerRef == null) return;

        const { video } = playerRef;
        const isPlaying = !video.paused && !video.ended;

        if (isPlaying !== isMainPlaying) {
          if (!isMainPlaying) {
            video.pause();
          } else {
            video.play().catch(() => {});
          }
        }
      });
    };

    // --- Master frame callback ---
    const onMasterFrame = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return;

      const mainVideo = mainRef.video;
      masterTime = mainVideo.currentTime;

      if (isLive) {
        masterSeekRangeEnd = mainRef.player.seekRange().end;
        masterTimeShift = masterSeekRangeEnd - masterTime;
      }

      if (supportsRVFC) {
        mainVideo.requestVideoFrameCallback(onMasterFrame);
      }
    };

    // --- Minion sync callback ---
    const createMinionSync = (w: GridWindow) => {
      const onMinionFrame = () => {
        const playerRef = windowPlayerRefMapRef.current[w.id];
        const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
        if (playerRef == null || mainRef == null) return;

        const { video, player } = playerRef;

        const f1TVPlaceholderWindow: GridWindow = { type: "main", id: "", streamId: "f1live" };
        const mainWindowToF1TVOffset = getOffset(
          playbackOffsets,
          userOffsetsRef.current,
          manifestOffsetsRef.current,
          f1TVPlaceholderWindow,
          mainWindow,
        );
        const offset = getOffset(
          playbackOffsets,
          userOffsetsRef.current,
          manifestOffsetsRef.current,
          w,
          mainWindow,
          mainWindowToF1TVOffset,
        );

        let drift: number;
        if (isLive) {
          const playerSeekRangeEnd = player.seekRange().end;
          const playerTimeShift = playerSeekRangeEnd - video.currentTime;
          drift = playerTimeShift - (masterTimeShift + offset);
        } else {
          const targetTime = masterTime - offset;
          drift = video.currentTime - targetTime;
        }

        const absDrift = Math.abs(drift);

        if (absDrift > DRIFT_HARD_SEEK_THRESHOLD) {
          // Hard seek — too far for gradual correction
          if (isLive) {
            const playerRef2 = windowPlayerRefMapRef.current[w.id];
            if (playerRef2 != null) {
              video.currentTime = playerRef2.player.seekRange().end - (masterTimeShift + offset);
            }
          } else {
            const targetTime = masterTime - offset;
            if (targetTime >= 0) {
              video.currentTime = targetTime;
            }
          }
          video.playbackRate = 1.0;
        } else if (absDrift > DRIFT_IGNORE_THRESHOLD) {
          // Rate correction — smooth, invisible
          video.playbackRate = drift > 0 ? RATE_CORRECTION_SLOW : RATE_CORRECTION_FAST;
        } else {
          video.playbackRate = 1.0;
        }

        // Update sync state for debug overlay
        const windowState = syncStateRef.current.find((s) => s.windowId === w.id);
        if (windowState) {
          windowState.driftMs = Math.round(drift * 1000);
          windowState.playbackRate = video.playbackRate;
        }

        if (supportsRVFC) {
          video.requestVideoFrameCallback(onMinionFrame);
        }
      };

      return onMinionFrame;
    };

    // --- Start sync loops ---
    const minionCallbacks: Array<{ windowId: string; callback: () => void }> = [];

    // Initialize sync state
    syncStateRef.current = windows
      .filter((w) => w.id !== mainWindow.id)
      .map((w) => ({ windowId: w.id, driftMs: 0, playbackRate: 1.0 }));

    // Start master tracking
    const startMaster = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return false;

      if (supportsRVFC) {
        mainRef.video.requestVideoFrameCallback(onMasterFrame);
      }
      return true;
    };

    // Start minion sync loops
    const startMinions = () => {
      windows.forEach((w) => {
        if (w.id === mainWindow.id) return;

        const playerRef = windowPlayerRefMapRef.current[w.id];
        if (playerRef == null) return;
        if (minionCallbacks.some((m) => m.windowId === w.id)) return;

        const callback = createMinionSync(w);
        minionCallbacks.push({ windowId: w.id, callback });

        if (supportsRVFC) {
          playerRef.video.requestVideoFrameCallback(callback);
        }
      });
    };

    // Force sync handler (for seeking, offset changes, visibility)
    // Directly seeks all minion videos instead of relying on rVFC,
    // which doesn't fire on paused videos (needed for frame-by-frame stepping).
    const forceSync = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return;

      const currentMasterTime = mainRef.video.currentTime;

      windows.forEach((w) => {
        if (w.id === mainWindow.id) return;
        const playerRef = windowPlayerRefMapRef.current[w.id];
        if (playerRef == null) return;

        const { video, player } = playerRef;

        const f1TVPlaceholderWindow: GridWindow = { type: "main", id: "", streamId: "f1live" };
        const mainWindowToF1TVOffset = getOffset(
          playbackOffsets,
          userOffsetsRef.current,
          manifestOffsetsRef.current,
          f1TVPlaceholderWindow,
          mainWindow,
        );
        const offset = getOffset(
          playbackOffsets,
          userOffsetsRef.current,
          manifestOffsetsRef.current,
          w,
          mainWindow,
          mainWindowToF1TVOffset,
        );

        if (isLive) {
          const masterSeekEnd = mainRef.player.seekRange().end;
          const masterShift = masterSeekEnd - currentMasterTime;
          video.currentTime = player.seekRange().end - (masterShift + offset);
        } else {
          const targetTime = currentMasterTime - offset;
          if (targetTime >= 0) {
            video.currentTime = targetTime;
          }
        }

        video.playbackRate = 1.0;
      });

      syncPlayPause();
    };

    // --- Event listeners ---
    let masterListenerCleanup: (() => void) | null = null;
    const setupMasterListeners = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return;

      mainRef.video.addEventListener("seeking", forceSync);
      offsetEmitter.addEventListener("change", forceSync);

      masterListenerCleanup = () => {
        mainRef.video.removeEventListener("seeking", forceSync);
        offsetEmitter.removeEventListener("change", forceSync);
      };
    };

    // --- Fallback for non-rVFC browsers: use rAF polling ---
    let rafId: number | null = null;
    const rafLoop = () => {
      onMasterFrame();
      minionCallbacks.forEach((m) => m.callback());
      syncPlayPause();
      rafId = requestAnimationFrame(rafLoop);
    };

    // --- Poll to discover and start players as they mount ---
    let masterStarted = false;
    const pollInterval = window.setInterval(() => {
      if (!masterStarted) {
        masterStarted = startMaster();
        if (masterStarted) {
          setupMasterListeners();
        }
      }
      startMinions();
      syncPlayPause();
    }, 200);

    // Start rAF fallback if needed
    if (!supportsRVFC) {
      rafId = requestAnimationFrame(rafLoop);
    }

    // --- Visibility change ---
    const onVisibilityChange = () => {
      if (!document.hidden) {
        forceSync();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Capture current ref map for cleanup
    const currentPlayerRefMap = windowPlayerRefMapRef.current;

    return () => {
      window.clearInterval(pollInterval);
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      masterListenerCleanup?.();

      // Reset playback rates on cleanup
      windows.forEach((w) => {
        const playerRef = currentPlayerRefMap[w.id];
        if (playerRef != null) {
          playerRef.video.playbackRate = 1.0;
        }
      });
    };
  }, [isLive, manifestOffsetsRef, offsetEmitter, playbackOffsets, userOffsetsRef, windowPlayerRefMapRef, windows]);

  return { syncStateRef, manifestOffsetsRef, presentationStartTimesRef };
};

const getOffset = (
  playbackOffsets: PlaybackOffsets,
  userOffsets: UserOffsets | null,
  manifestOffsets: ManifestOffsets,
  w: GridWindow,
  mainWindow: MainGridWindow,
  additionalOffset = 0,
): number => {
  let userOffset = 0;
  if (w.type === "driver") {
    userOffset = userOffsets?.additionalStreams[w.driverId] ?? 0;
  } else if (w.type === "main") {
    userOffset = userOffsets?.additionalStreams[mainWindow.streamId] ?? 0;
  } else {
    userOffset = userOffsets?.additionalStreams[w.type] ?? 0;
  }

  // Prefer manifest-derived offsets (from HLS #EXT-X-PROGRAM-DATE-TIME tags)
  // over F1's static playbackOffsets, as they're measured per-session and more accurate.
  const manifestOffset = manifestOffsets[w.id];
  if (manifestOffset != null) {
    return manifestOffset + userOffset + additionalOffset;
  }

  let f1Offset = 0;
  if (w.type === "main") {
    f1Offset = playbackOffsets.f1[w.streamId]?.[mainWindow.streamId] ?? 0;
  } else {
    f1Offset = playbackOffsets.f1[w.type]?.[mainWindow.streamId] ?? 0;
  }

  return f1Offset + userOffset + additionalOffset;
};
