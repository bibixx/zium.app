import { forwardRef, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { QualityLevel } from "videojs-contrib-quality-levels";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { MainGridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
import { attachUseBestQuality } from "../../utils/attachUseBestQuality";
import { VideoJS } from "../VideoJS";
import { VideoWindowWrapper } from "./VideoWindowWrapper";
import { attachDisableTextTracks } from "../../utils/attachDisableTextTracks";

interface MainVideoWindowProps extends VideoWindowProps {
  gridWindow: MainGridWindow;
  executeOnAll: (cb: (player: VideoJsPlayer) => void, callerId: string) => void;
}

export const MainVideoWindow = forwardRef<
  VideoJsPlayer | null,
  MainVideoWindowProps
>(({ gridWindow, executeOnAll }, forwardedRef) => {
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const streamVideoState = useStreamVideo(gridWindow.url);

  const ref = (r: VideoJsPlayer | null) => {
    setRef(forwardedRef, r);
    playerRef.current = r;
  };

  const onReady = (player: VideoJsPlayer) => {
    const callerId = gridWindow.id;
    onVideoWindowReadyBase(player, executeOnAll, gridWindow.id);

    player.on("seeking", () => {
      const currentTime = player.currentTime();
      executeOnAll((p) => p.currentTime(currentTime), callerId);
    });

    player.on("pause", () => {
      executeOnAll((p) => p.pause(), callerId);
    });

    player.on("play", () => {
      executeOnAll((p) => p.play(), callerId);
    });

    attachUseBestQuality(player);
    attachDisableTextTracks(player);

    // player.volume(0);
  };

  const onFocusAudio = () => {
    playerRef.current?.muted(false);

    executeOnAll((player) => {
      player.muted(true);
    }, gridWindow.id);
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
      />

      <div
        className="video-window__available-drivers-container"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button onClick={onFocusAudio}>Focus audio</button>
      </div>
    </VideoWindowWrapper>
  );
});

const ADDITIONAL_OPTIONS: VideoJsPlayerOptions = {
  muted: true,
  controlBar: {
    playToggle: true,
    remainingTimeDisplay: true,
    progressControl: true,
    volumePanel: true,
    audioTrackButton: true,
    fullscreenToggle: true,
  },
};
