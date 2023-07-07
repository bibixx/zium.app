import { forwardRef, useEffect, useRef, useState } from "react";
import objectMerge from "object-merge";
import { BufferingOverlay, SubtitleOverlay, UIContainer, UIFactory, UIManager } from "bitmovin-player-ui";
import { UIConfig } from "bitmovin-player-ui/dist/js/framework/uiconfig";
// import "bitmovin-player-ui/dist/css/bitmovinplayer-ui.min.css";

import { Player, PlayerAPI, PlayerConfig, PlayerEvent, SourceConfig } from "bitmovin-player";
import classNames from "classnames";
import { setRef } from "../../utils/setRef";
import { VideoStreamInfo } from "../../hooks/useStreamVideo/useStreamVideo.api";
import { GridLayoutFillMode } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { toggleFullScreen } from "../../utils/toggleFullScreen";
import styles from "./VideoJS.module.scss";

export interface VideoJSOptions extends PlayerConfig {
  ui?: UIConfig | false;
  noBufferUI?: boolean;
}

export type AdditionalVideoJSOptions = Partial<VideoJSOptions>;

interface VideoJSProps {
  videoStreamInfo: VideoStreamInfo;
  options: AdditionalVideoJSOptions;
  onReady: (player: PlayerAPI) => void;
  isPaused: boolean;
  areClosedCaptionsOn?: boolean;
  isMuted?: boolean;
  volume?: number;
  fillMode?: GridLayoutFillMode;
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
      areClosedCaptionsOn = false,
      fillMode = "fill",
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

        player.on(PlayerEvent.Ready, () => {
          push(["trackEvent", "impression", "impression count"]);
          setIsVisible(true);
          onReady(player);
        });

        player.setVolume(volume);
        setSubtitles(player, areClosedCaptionsOn);

        if (isMuted) {
          playerRef.current?.mute();
        } else {
          playerRef.current?.unmute();
        }

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
      setSubtitles(playerRef.current, areClosedCaptionsOn);
    }, [areClosedCaptionsOn]);

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

function setSubtitles(player: PlayerAPI | null, enabled: boolean) {
  if (player == null) {
    return;
  }

  const [firstSubtitle] = player.subtitles.list();

  if (firstSubtitle == null) {
    return;
  }

  if (!enabled) {
    player.subtitles.disable(firstSubtitle.id);
    return;
  }

  player.subtitles.enable(firstSubtitle.id, true);
}
