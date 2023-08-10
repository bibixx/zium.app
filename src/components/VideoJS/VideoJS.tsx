import { forwardRef, useEffect, useRef, useState } from "react";
import objectMerge from "object-merge";
import { SubtitleOverlay, UIContainer, UIFactory, UIManager } from "bitmovin-player-ui";
import { UIConfig } from "bitmovin-player-ui/dist/js/framework/uiconfig";
import { AudioTrack, Player, PlayerAPI, PlayerConfig, PlayerEvent, SourceConfig, SubtitleTrack } from "bitmovin-player";
import classNames from "classnames";
import { setRef } from "../../utils/setRef";
import { VideoStreamInfo } from "../../hooks/useStreamVideo/useStreamVideo.api";
import { GridLayoutFillMode } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { toggleFullScreen } from "../../utils/toggleFullScreen";
import styles from "./VideoJS.module.scss";
import { BufferingOverlay } from "./BufferingOverlay";

export interface VideoJSOptions extends PlayerConfig {
  ui?: UIConfig | false;
  noBufferUI?: boolean;
}

export type AdditionalVideoJSOptions = Partial<VideoJSOptions>;

interface VideoJSProps {
  videoStreamInfo: VideoStreamInfo;
  options: AdditionalVideoJSOptions;
  onReady?: (player: PlayerAPI) => void;
  isPaused: boolean;
  isMuted?: boolean;
  volume?: number;
  fillMode?: GridLayoutFillMode;
  selectedSubtitleId?: SubtitleTrack["id"] | null;
  setAvailableSubtitles?: (subtitles: SubtitleTrack[]) => void;
  selectedAudioTrackId?: AudioTrack["id"] | null;
  setAvailableAudioTracks?: (audioTrack: AudioTrack[]) => void;
  startAt?: number;
}

export const VideoJS = forwardRef<PlayerAPI | null, VideoJSProps>(
  (
    {
      videoStreamInfo,
      options: overwrittenOptions,
      onReady,
      isPaused,
      volume = 0,
      isMuted = false,
      fillMode = "fill",
      selectedSubtitleId = null,
      setAvailableSubtitles,
      selectedAudioTrackId = null,
      setAvailableAudioTracks,
      startAt,
    },
    ref,
  ) => {
    const placeholderRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<PlayerAPI | null>(null);
    const uiManagerRef = useRef<UIManager | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { push } = useAnalytics();

    useEffect(() => {
      async function run() {
        const placeholderEl = placeholderRef.current;
        if (placeholderEl == null) {
          return;
        }

        const baseOptions: VideoJSOptions = {
          key: "<PLAYER_LICENSE_KEY>",
          playback: {
            muted: false,
            autoplay: !isPaused,
          },
          logs: {
            bitmovin: false,
          },
          ui: {
            playbackSpeedSelectionEnabled: false,
          },
        };
        const options = objectMerge(baseOptions, overwrittenOptions) as VideoJSOptions;
        const player = new Player(placeholderEl, options);

        if (options.ui !== false) {
          uiManagerRef.current = UIFactory.buildDefaultUI(player, options.ui);
        } else if (!options.noBufferUI) {
          const myUi = new UIContainer({
            components: [new BufferingOverlay({ showDelayMs: 10 }), new SubtitleOverlay()],
            hideDelay: -1,
          });

          uiManagerRef.current = new UIManager(player, myUi);
        } else {
          const myUi = new UIContainer({
            components: [new SubtitleOverlay()],
            hideDelay: -1,
          });

          uiManagerRef.current = new UIManager(player, myUi);
        }

        const sourceConfig = getSourceConfig(videoStreamInfo);

        await player.load(sourceConfig);
        if (startAt != null) {
          player.seek(startAt);
        }

        player.on(PlayerEvent.Ready, () => {
          onReady?.(player);
          push(["trackEvent", "impression", "impression count"]);
          setIsVisible(true);
        });

        player.setVolume(volume);

        if (isMuted) {
          playerRef.current?.mute();
        } else {
          playerRef.current?.unmute();
        }

        setSubtitles(player, selectedSubtitleId);
        if (setAvailableSubtitles != null) {
          setAvailableSubtitles(player.subtitles.list());

          player.on(PlayerEvent.SubtitleAdded, () => {
            setAvailableSubtitles(player.subtitles.list());
          });
        }

        setAudioTrack(player, selectedAudioTrackId);
        if (setAvailableAudioTracks != null) {
          setAvailableAudioTracks(player.getAvailableAudio());

          player.on(PlayerEvent.AudioAdded, () => {
            setAvailableAudioTracks(player.getAvailableAudio());
          });
        }

        player.getAvailableAudio();

        playerRef.current = player;
        setRef(ref, player);
      }

      run();

      return () => {
        playerRef.current?.destroy();
        uiManagerRef.current?.release();
        playerRef.current = null;
        uiManagerRef.current = null;
        setRef(ref, null);
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overwrittenOptions, videoStreamInfo]);

    useEffect(() => {
      if (isPaused) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play();
      }
    }, [isPaused]);

    useEffect(() => {
      playerRef.current?.setVolume(volume);
    }, [volume]);

    useEffect(() => {
      setSubtitles(playerRef.current, selectedSubtitleId);
    }, [selectedSubtitleId]);

    useEffect(() => {
      setAudioTrack(playerRef.current, selectedAudioTrackId);
    }, [selectedAudioTrackId]);

    useEffect(() => {
      if (isMuted) {
        playerRef.current?.mute();
      } else {
        playerRef.current?.unmute();
      }
    }, [isMuted]);

    return (
      <div
        ref={placeholderRef}
        onDoubleClick={toggleFullScreen}
        className={classNames(styles.videoWrapper, {
          [styles.isVisible]: isVisible,
          [styles.isFit]: fillMode === "fit",
          [styles.isFill]: fillMode === "fill",
        })}
      />
    );
  },
);

function getSourceConfig(videoStreamInfo: VideoStreamInfo): SourceConfig {
  if (videoStreamInfo.streamType === "HLS") {
    return {
      hls: videoStreamInfo.videoUrl,
    };
  }

  return {
    dash: videoStreamInfo.videoUrl,
    drm: {
      widevine: {
        LA_URL: videoStreamInfo.laURL,
      },
    },
  };
}

function setSubtitles(player: PlayerAPI | null, selectedSubtitleId: string | null) {
  if (player == null) {
    return;
  }

  const subtitles = player.subtitles.list();

  if (selectedSubtitleId != null) {
    player.subtitles.enable(selectedSubtitleId, true);
    return;
  }

  subtitles.forEach((s) => {
    player.subtitles.disable(s.id);
  });
}

function setAudioTrack(player: PlayerAPI | null, selectedAudioTrackId: string | null) {
  if (player == null) {
    return;
  }

  if (selectedAudioTrackId != null) {
    player.setAudio(selectedAudioTrackId);
    return;
  }

  const [firstAudioTrack] = player.getAvailableAudio();
  player.setAudio(firstAudioTrack.id);
}
