import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { PlaybackOffsets } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridWindow, MainGridWindow } from "../../../types/GridWindow";
import { UserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { VideoPlayerRef } from "../../../components/VideoPlayer/VideoPlayer.types";
import { ManifestOffsets, useManifestOffsets } from "../../../hooks/useManifestOffsets/useManifestOffsets";

// Drift thresholds (in seconds)
const DRIFT_IGNORE_THRESHOLD = 0.05; // < 50ms — imperceptible
const DRIFT_HARD_SEEK_THRESHOLD = 0.3; // > 300ms — too far for rate correction on replay streams
const LIVE_DRIFT_IGNORE_THRESHOLD = 0.5; // live edges/segments naturally jitter more than replays
const LIVE_DRIFT_HARD_SEEK_THRESHOLD = 20;
const LIVE_FORCE_SYNC_HARD_SEEK_THRESHOLD = 5;
const LIVE_HARD_SEEK_COOLDOWN_MS = 60_000;
const MANIFEST_OFFSET_MIN_ABS_SECONDS = 0.25;
const PLAYBACK_RATE_UPDATE_EPSILON = 0.005;
const RATE_CORRECTION_FAST = 1.03;
const RATE_CORRECTION_SLOW = 0.97;
const LIVE_RATE_CORRECTION_MIN_DELTA = 0.04;
const LIVE_RATE_CORRECTION_MAX_DELTA = 0.2;
const LIVE_RATE_CORRECTION_STEP = 0.04;
const LIVE_RATE_CORRECTION_PROPORTIONAL_GAIN = 0.04;

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

  // Keep a ref to windows so the effect can read the current value without re-running
  // when only layout positions change (structuredClone creates new refs on every dispatch).
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  // Only re-run the sync effect when the set of window IDs changes, not on every position update.
  const windowIds = useMemo(() => windows.map((w) => w.id).join(","), [windows]);

  useEffect(() => {
    const currentWindows = windowsRef.current;
    const mainWindow = currentWindows.find((w): w is MainGridWindow => w.type === "main");
    if (mainWindow == null) return;

    let isDisposed = false;

    // Shared master time — updated every frame by the master's rVFC callback
    let masterTime = 0;
    let masterTimeShift = 0; // for live: distance from live edge
    const liveHardSeekTimestamps: Record<string, number> = {};

    const shouldHardSeek = (windowId: string, drift: number, forceSync = false) => {
      const threshold = isLive
        ? forceSync
          ? LIVE_FORCE_SYNC_HARD_SEEK_THRESHOLD
          : LIVE_DRIFT_HARD_SEEK_THRESHOLD
        : DRIFT_HARD_SEEK_THRESHOLD;

      if (Math.abs(drift) <= threshold) {
        return false;
      }

      if (!isLive) {
        return true;
      }

      const now = performance.now();
      const lastHardSeek = liveHardSeekTimestamps[windowId] ?? -Infinity;
      if (now - lastHardSeek < LIVE_HARD_SEEK_COOLDOWN_MS) {
        return false;
      }

      liveHardSeekTimestamps[windowId] = now;
      return true;
    };

    const setPlaybackRate = (video: HTMLVideoElement, playbackRate: number) => {
      if (Math.abs(video.playbackRate - playbackRate) > PLAYBACK_RATE_UPDATE_EPSILON) {
        video.playbackRate = playbackRate;
      }
    };

    const setPlaybackRateForDrift = (video: HTMLVideoElement, drift: number) => {
      const ignoreThreshold = isLive ? LIVE_DRIFT_IGNORE_THRESHOLD : DRIFT_IGNORE_THRESHOLD;

      if (Math.abs(drift) <= ignoreThreshold) {
        setPlaybackRate(video, 1.0);
        return;
      }

      if (isLive) {
        const correctionDelta = Math.min(
          LIVE_RATE_CORRECTION_MAX_DELTA,
          Math.max(LIVE_RATE_CORRECTION_MIN_DELTA, Math.abs(drift) * LIVE_RATE_CORRECTION_PROPORTIONAL_GAIN),
        );
        const quantizedCorrectionDelta =
          Math.round(correctionDelta / LIVE_RATE_CORRECTION_STEP) * LIVE_RATE_CORRECTION_STEP;
        setPlaybackRate(video, drift > 0 ? 1 - quantizedCorrectionDelta : 1 + quantizedCorrectionDelta);
        return;
      }

      setPlaybackRate(video, drift > 0 ? RATE_CORRECTION_SLOW : RATE_CORRECTION_FAST);
    };

    // --- Play/pause sync (runs periodically) ---
    const syncPlayPause = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return;

      const mainVideo = mainRef.video;
      const isMainPlaying = !mainVideo.paused && !mainVideo.ended;

      windowsRef.current.forEach((w) => {
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
      if (isDisposed) return;

      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return;

      const mainVideo = mainRef.video;
      masterTime = mainVideo.currentTime;

      if (isLive) {
        masterTimeShift = mainRef.player.seekRange().end - masterTime;
      }

      if (supportsRVFC && !isDisposed) {
        mainVideo.requestVideoFrameCallback(onMasterFrame);
      }
    };

    // --- Minion sync callback ---
    const createMinionSync = (w: GridWindow) => {
      const onMinionFrame = () => {
        if (isDisposed) return;

        const playerRef = windowPlayerRefMapRef.current[w.id];
        const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
        if (playerRef == null || mainRef == null) return;

        const { video, player } = playerRef;

        // Don't sync streams that are still buffering/seeking — they'll catch up
        // once ready. Seeking them again just restarts the buffer cycle (especially
        // problematic with DRM-encrypted streams where seeks are slow).
        if (video.seeking || video.readyState < 3) {
          if (supportsRVFC && !isDisposed) {
            video.requestVideoFrameCallback(onMinionFrame);
          }
          return;
        }

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

        const targetTime = isLive
          ? getLiveTargetTime(
              player,
              masterTime,
              masterTimeShift,
              offset,
              hasManifestTimeline(manifestOffsetsRef.current, w.id),
            )
          : masterTime - offset;
        const drift = video.currentTime - targetTime;

        if (shouldHardSeek(w.id, drift)) {
          // Hard seek — too far for gradual correction. Live streams can land a little
          // off-target after a seek, so live hard seeks are deliberately throttled.
          if (targetTime >= 0) {
            video.currentTime = targetTime;
          }
          setPlaybackRate(video, 1.0);
        } else {
          // Rate correction — smooth, invisible, and avoids seek loops on live streams.
          setPlaybackRateForDrift(video, drift);
        }

        // Update sync state for debug overlay
        const windowState = syncStateRef.current.find((s) => s.windowId === w.id);
        if (windowState) {
          windowState.driftMs = Math.round(drift * 1000);
          windowState.playbackRate = video.playbackRate;
        }

        if (supportsRVFC && !isDisposed) {
          video.requestVideoFrameCallback(onMinionFrame);
        }
      };

      return onMinionFrame;
    };

    // --- Start sync loops ---
    const minionCallbacks: Array<{ windowId: string; callback: () => void }> = [];

    // Initialize sync state
    syncStateRef.current = currentWindows
      .filter((w) => w.id !== mainWindow.id)
      .map((w) => ({ windowId: w.id, driftMs: 0, playbackRate: 1.0 }));

    // Start master tracking
    const startMaster = () => {
      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];
      if (mainRef == null) return false;

      onMasterFrame();
      return true;
    };

    // Start minion sync loops
    const startMinions = () => {
      currentWindows.forEach((w) => {
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

      windowsRef.current.forEach((w) => {
        if (w.id === mainWindow.id) return;
        const playerRef = windowPlayerRefMapRef.current[w.id];
        if (playerRef == null) return;

        const { video, player } = playerRef;

        // Skip minions that are already seeking/buffering to avoid cascade-seeking
        if (video.seeking || video.readyState < 3) return;

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

        const targetTime = isLive
          ? getLiveTargetTime(
              player,
              currentMasterTime,
              mainRef.player.seekRange().end - currentMasterTime,
              offset,
              hasManifestTimeline(manifestOffsetsRef.current, w.id),
            )
          : currentMasterTime - offset;

        const drift = video.currentTime - targetTime;
        if (targetTime >= 0 && shouldHardSeek(w.id, drift, true)) {
          video.currentTime = targetTime;
          setPlaybackRate(video, 1.0);
        } else {
          setPlaybackRateForDrift(video, drift);
        }
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
      if (isDisposed) return;

      onMasterFrame();
      minionCallbacks.forEach((m) => m.callback());
      syncPlayPause();

      if (!isDisposed) {
        rafId = requestAnimationFrame(rafLoop);
      }
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
      isDisposed = true;
      window.clearInterval(pollInterval);
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      masterListenerCleanup?.();

      // Reset playback rates on cleanup
      currentWindows.forEach((w) => {
        const playerRef = currentPlayerRefMap[w.id];
        if (playerRef != null) {
          playerRef.video.playbackRate = 1.0;
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, manifestOffsetsRef, offsetEmitter, playbackOffsets, userOffsetsRef, windowPlayerRefMapRef, windowIds]);

  return { syncStateRef, manifestOffsetsRef, presentationStartTimesRef };
};

const getLiveTargetTime = (
  player: VideoPlayerRef["player"],
  masterTime: number,
  masterTimeShift: number,
  offset: number,
  usePresentationTimeline: boolean,
) => {
  const seekRange = player.seekRange();

  // If Shaka exposes a presentation timeline for this stream (even when the
  // derived PDT offset is 0), the player's currentTime values are on the same
  // clock as the main stream. Prefer that over comparing seekRange.end values,
  // because live seek ranges refresh independently and can jitter by a segment.
  const targetTime = usePresentationTimeline ? masterTime - offset : seekRange.end - (masterTimeShift + offset);

  return clampToSeekRange(targetTime, seekRange);
};

const clampToSeekRange = (time: number, seekRange: { start: number; end: number }) => {
  if (!Number.isFinite(seekRange.start) || !Number.isFinite(seekRange.end) || seekRange.end <= seekRange.start) {
    return time;
  }

  return Math.min(Math.max(time, seekRange.start), seekRange.end);
};

const hasManifestTimeline = (manifestOffsets: ManifestOffsets, windowId: string) => manifestOffsets[windowId] != null;

const getUsableManifestOffset = (manifestOffsets: ManifestOffsets, windowId: string) => {
  const manifestOffset = manifestOffsets[windowId];
  if (manifestOffset == null || Math.abs(manifestOffset) < MANIFEST_OFFSET_MIN_ABS_SECONDS) {
    return null;
  }

  return manifestOffset;
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
  // Manifest offsets are already relative to the currently selected main stream,
  // so the F1-live conversion offset is only needed for static API offsets.
  const manifestOffset = getUsableManifestOffset(manifestOffsets, w.id);
  if (manifestOffset != null) {
    return manifestOffset + userOffset;
  }

  let f1Offset = 0;
  if (w.type === "main") {
    f1Offset = playbackOffsets.f1[w.streamId]?.[mainWindow.streamId] ?? 0;
  } else if (w.type !== "live-timing") {
    f1Offset = playbackOffsets.f1[w.type]?.[mainWindow.streamId] ?? 0;
  }

  return f1Offset + userOffset + additionalOffset;
};
