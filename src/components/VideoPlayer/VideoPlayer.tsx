import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import shaka from "shaka-player";
import classNames from "classnames";
import { posthog } from "posthog-js";
import { setRef } from "../../utils/setRef";
import { toggleFullScreen } from "../../utils/toggleFullScreen";
import { VideoStreamInfo } from "../../hooks/useStreamVideo/useStreamVideo.api";
import { GridLayoutFillMode } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useDeferLoad } from "../../views/Viewer/hooks/useStaggeredLoad";
import { VideoPlayerRef, VideoPlayerOptions, TextTrackInfo, AudioTrackInfo } from "./VideoPlayer.types";
import { BufferingOverlay } from "./BufferingOverlay";
import { registerSharedBandwidthPlugin, sharedBandwidthEstimate } from "./sharedBandwidthPlugin";
import styles from "./VideoPlayer.module.scss";

registerSharedBandwidthPlugin();

interface VideoPlayerProps {
  videoStreamInfo: VideoStreamInfo;
  options?: VideoPlayerOptions;
  onReady?: (ref: VideoPlayerRef) => void;
  onError?: (error: unknown) => void;
  isPaused: boolean;
  isMuted?: boolean;
  volume?: number;
  fillMode?: GridLayoutFillMode;
  selectedSubtitleId?: string | null;
  setAvailableSubtitles?: (subtitles: TextTrackInfo[]) => void;
  selectedAudioLanguage?: string | null;
  setAvailableAudioTracks?: (audioTracks: AudioTrackInfo[]) => void;
  startAt?: number;
}

export const VideoPlayer = forwardRef<VideoPlayerRef | null, VideoPlayerProps>(
  (
    {
      videoStreamInfo,
      options = {},
      onReady,
      onError,
      isPaused,
      volume = 0,
      isMuted = false,
      fillMode = "fill",
      selectedSubtitleId = null,
      setAvailableSubtitles,
      selectedAudioLanguage = null,
      setAvailableAudioTracks,
      startAt,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<shaka.Player | null>(null);
    const attachedRef = useRef<Promise<void> | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { capture } = useAnalytics();
    const showBufferingUI = !options.noBufferUI;
    const loadIdRef = useRef(0);
    const isDeferred = useDeferLoad();
    const isDeferredRef = useRef(isDeferred);
    isDeferredRef.current = isDeferred;
    const preloadManagerRef = useRef<shaka.media.PreloadManager | null>(null);
    const pendingLoadRef = useRef(false);

    // Create and destroy the Shaka Player instance with the component lifecycle
    useEffect(() => {
      const videoEl = videoRef.current;
      if (videoEl == null) return;

      const player = new shaka.Player();
      playerRef.current = player;

      player.configure({
        abr: {
          enabled: true,
          restrictToElementSize: true,
          ignoreDevicePixelRatio: false,
          defaultBandwidthEstimate: sharedBandwidthEstimate.value,
        },
        streaming: {
          bufferingGoal: 5,
          rebufferingGoal: 0.5,
          bufferBehind: 5,
          segmentPrefetchLimit: 0,
        },
      });

      player.addEventListener("error", (event) => {
        const detail = (event as Event & { detail: unknown }).detail;
        console.error("[VideoPlayer] Shaka error:", detail);
        posthog.captureException(detail instanceof Error ? detail : new Error(String(detail)), {
          source: "shaka_player",
          videoUrl: player.getAssetUri(),
        });
        onError?.(detail);
      });

      attachedRef.current = player.attach(videoEl).catch((err) => {
        console.error("[VideoPlayer] Attach error:", err);
        posthog.captureException(err instanceof Error ? err : new Error(String(err)), {
          source: "shaka_player_attach",
        });
        onError?.(err);
      }) as Promise<void>;

      return () => {
        playerRef.current = null;
        attachedRef.current = null;
        setRef(ref, null);
        player.destroy();
      };
      // Only run on mount/unmount — the player instance persists across source changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doFullLoad = useCallback(async () => {
      const currentLoadId = loadIdRef.current;
      const player = playerRef.current;
      const videoEl = videoRef.current;
      if (player == null || videoEl == null) return;

      try {
        configureDrm(player, videoStreamInfo);

        if (options.audioLanguage != null) {
          player.configure({ preferredAudioLanguage: options.audioLanguage[0] });
        }

        const preloadManager = preloadManagerRef.current;
        if (preloadManager != null) {
          preloadManagerRef.current = null;
          await player.load(preloadManager);
        } else {
          await player.load(videoStreamInfo.videoUrl, startAt ?? undefined);
        }

        if (currentLoadId !== loadIdRef.current) return;

        if (options.autoplay !== false && !isPaused) {
          videoEl.play().catch(() => {});
        }

        videoEl.volume = volume / 100;
        videoEl.muted = isMuted;

        const videoPlayerRef: VideoPlayerRef = { player, video: videoEl };

        updateSubtitles(player, selectedSubtitleId);
        if (setAvailableSubtitles != null) {
          setAvailableSubtitles(getTextTracks(player));
        }

        updateAudioLanguage(player, selectedAudioLanguage);
        if (setAvailableAudioTracks != null) {
          setAvailableAudioTracks(getAudioTracks(player));
        }

        setRef(ref, videoPlayerRef);
        onReady?.(videoPlayerRef);
        capture("video_impression");
        setIsVisible(true);
        pendingLoadRef.current = false;
      } catch (error) {
        if (currentLoadId !== loadIdRef.current) return;
        // Suppress expected LOAD_INTERRUPTED (7000) and OPERATION_ABORTED (7001) errors
        if (isShakaInterruptError(error)) return;
        console.error("[VideoPlayer] Load error:", error);
        posthog.captureException(error instanceof Error ? error : new Error(String(error)), {
          source: "shaka_player_load",
          videoUrl: videoStreamInfo.videoUrl,
        });
        onError?.(error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoStreamInfo]);

    // Load a new source whenever videoStreamInfo changes
    useEffect(() => {
      ++loadIdRef.current;

      async function loadSource() {
        // Wait for player.attach() to complete before loading
        if (attachedRef.current != null) {
          await attachedRef.current;
        }

        const player = playerRef.current;
        if (player == null) return;

        try {
          await player.unload();
        } catch {
          // Ignore unload errors (e.g. player already destroyed)
        }

        // Destroy any previous preload
        if (preloadManagerRef.current != null) {
          try {
            await preloadManagerRef.current.destroy();
          } catch {
            // Ignore destroy errors on stale preloads
          }
          preloadManagerRef.current = null;
        }

        if (isDeferredRef.current) {
          // Preload manifest + init segments without starting playback
          try {
            configureDrm(player, videoStreamInfo);
            const manager = await player.preload(videoStreamInfo.videoUrl, startAt ?? undefined);
            preloadManagerRef.current = manager;
            pendingLoadRef.current = true;

            // If the stagger released while we were preloading, the deferred
            // release effect already fired and missed pendingLoadRef. Load now.
            if (!isDeferredRef.current) {
              await doFullLoad();
            }
          } catch {
            // Preload can fail if interrupted — that's OK
          }
          return;
        }

        await doFullLoad();
      }

      setIsVisible(false);
      loadSource();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoStreamInfo]);

    // When deferred load is released, do the full load
    useEffect(() => {
      if (!isDeferred && pendingLoadRef.current) {
        doFullLoad();
      }
    }, [isDeferred, doFullLoad]);

    // Listen for track changes (separate from load to avoid stale closures)
    useEffect(() => {
      const player = playerRef.current;
      if (player == null) return;

      const onTracksChanged = () => {
        setAvailableSubtitles?.(getTextTracks(player));
        setAvailableAudioTracks?.(getAudioTracks(player));
      };

      player.addEventListener("trackschanged", onTracksChanged);
      return () => player.removeEventListener("trackschanged", onTracksChanged);
    }, [setAvailableSubtitles, setAvailableAudioTracks]);

    useEffect(() => {
      const videoEl = videoRef.current;
      if (videoEl == null) return;

      if (isPaused) {
        videoEl.pause();
      } else {
        videoEl.play().catch(() => {});
      }
    }, [isPaused]);

    useEffect(() => {
      const videoEl = videoRef.current;
      if (videoEl == null) return;

      videoEl.volume = volume / 100;
    }, [volume]);

    useEffect(() => {
      if (playerRef.current == null) return;
      updateSubtitles(playerRef.current, selectedSubtitleId);
    }, [selectedSubtitleId]);

    useEffect(() => {
      if (playerRef.current == null) return;
      updateAudioLanguage(playerRef.current, selectedAudioLanguage);
    }, [selectedAudioLanguage]);

    useEffect(() => {
      const videoEl = videoRef.current;
      if (videoEl == null) return;

      videoEl.muted = isMuted;
    }, [isMuted]);

    return (
      <div
        onDoubleClick={toggleFullScreen}
        className={classNames(styles.videoWrapper, {
          [styles.isVisible]: isVisible,
          [styles.isFit]: fillMode === "fit",
          [styles.isFill]: fillMode === "fill",
        })}
      >
        <video ref={videoRef} />
        {showBufferingUI && <BufferingOverlay videoRef={videoRef} playerRef={playerRef} />}
      </div>
    );
  },
);

function isShakaInterruptError(error: unknown): boolean {
  if (error == null || typeof error !== "object") return false;
  const code = (error as { code?: number }).code;
  // 7000 = LOAD_INTERRUPTED, 7001 = OPERATION_ABORTED
  return code === 7000 || code === 7001;
}

function configureDrm(player: shaka.Player, videoStreamInfo: VideoStreamInfo) {
  // Reset DRM and networking state from previous source
  player.getNetworkingEngine()?.clearAllRequestFilters();
  player.configure({ drm: { servers: {} } });

  // Configure explicit license server if provided (DASH/non-HLS streams)
  if (videoStreamInfo.laURL != null) {
    player.configure({
      drm: {
        servers: {
          "com.widevine.alpha": videoStreamInfo.laURL,
        },
      },
    });
  }

  // Register entitlement token for license requests — works for both
  // explicit laURL and auto-detected license server from HLS #EXT-X-SESSION-KEY
  if (videoStreamInfo.entitlementToken != null) {
    const entitlementToken = videoStreamInfo.entitlementToken;
    player.getNetworkingEngine()?.registerRequestFilter((type, request) => {
      if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
        request.headers["entitlementtoken"] = entitlementToken;
      }
    });
  }
}

function getTextTracks(player: shaka.Player): TextTrackInfo[] {
  return player.getTextTracks().map((track) => ({
    id: String(track.id),
    lang: track.language,
    label: track.label ?? "",
  }));
}

function getAudioTracks(player: shaka.Player): AudioTrackInfo[] {
  return player.getAudioTracks().map((track) => ({
    id: track.label ?? track.language,
    lang: track.label ?? track.language,
  }));
}

function updateSubtitles(player: shaka.Player, selectedSubtitleId: string | null) {
  if (selectedSubtitleId != null) {
    const track = player.getTextTracks().find((t) => String(t.id) === selectedSubtitleId);
    if (track != null) {
      player.selectTextTrack(track);
    }
    return;
  }

  player.selectTextTrack(null);
}

function updateAudioLanguage(player: shaka.Player, language: string | null) {
  if (language == null) {
    return;
  }

  const audioTrack = player.getAudioTracks().find((t) => t.label === language || t.language === language);
  if (audioTrack != null) {
    player.selectAudioTrack(audioTrack);
  }
}
