import { forwardRef, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { MainGridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
import { attachUseBestQuality } from "../../utils/attachUseBestQuality";
import { VideoJS } from "../VideoJS";
import { VideoWindowWrapper } from "./VideoWindowWrapper";
import { attachDisableTextTracks } from "../../utils/attachDisableTextTracks";

const START_AT = 12 * 60;

interface MainVideoWindowProps extends VideoWindowProps {
  gridWindow: MainGridWindow;
  onPlayingChange: (isPaused: boolean) => void;
  onWindowAudioFocus: () => void;
  isAudioFocused: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
  executeOnAll: (cb: (player: VideoJsPlayer) => void, callerId: string) => void;
}

export const MainVideoWindow = forwardRef<
  VideoJsPlayer | null,
  MainVideoWindowProps
>(
  (
    {
      gridWindow,
      executeOnAll,
      onPlayingChange,
      isPaused,
      isAudioFocused,
      onWindowAudioFocus,
      volume,
      setVolume,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<VideoJsPlayer | null>(null);
    const streamVideoState = useStreamVideo(gridWindow.url);

    const ref = (r: VideoJsPlayer | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: VideoJsPlayer) => {
      const callerId = gridWindow.id;
      onVideoWindowReadyBase(player);

      player.currentTime(START_AT);
      player.play();

      player.on("seeking", () => {
        const currentTime = player.currentTime();
        executeOnAll((p) => p.currentTime(currentTime), callerId);
      });

      player.on("pause", () => {
        onPlayingChange(true);
      });

      player.on("play", () => {
        onPlayingChange(false);
      });

      player.on("volumechange", () => {
        if (player.volume() === 0) {
          return;
        }

        setVolume(player.volume());
        onWindowAudioFocus();
      });

      attachUseBestQuality(player);
      attachDisableTextTracks(player);
    };

    if (streamVideoState.state !== "done") {
      return null;
    }

    return (
      <VideoWindowWrapper>
        <VideoJS
          url={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
          volume={isAudioFocused ? volume : 0}
        />

        <div
          className="video-window__available-drivers-container"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button onClick={onWindowAudioFocus}>Focus audio</button>
        </div>
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: VideoJsPlayerOptions = {
  controlBar: {
    playToggle: true,
    remainingTimeDisplay: true,
    progressControl: true,
    volumePanel: true,
    audioTrackButton: true,
    fullscreenToggle: false,
  },
};
