import { forwardRef, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { BaseGridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
import { attachUseBestQuality } from "../../utils/attachUseBestQuality";
import { VideoJS } from "../VideoJS/VideoJS";
import { VideoWindowWrapper } from "./VideoWindowWrapper/VideoWindowWrapper";

interface DataChannelVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
}

export const DataChannelVideoWindow = forwardRef<VideoJsPlayer | null, DataChannelVideoWindowProps>(
  ({ isPaused, streamUrl }, forwardedRef) => {
    const playerRef = useRef<VideoJsPlayer | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);

    const ref = (r: VideoJsPlayer | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: VideoJsPlayer) => {
      onVideoWindowReadyBase(player);

      // attachUseBestQuality(player);
    };

    if (streamVideoState.state !== "done") {
      return null;
    }

    return (
      <VideoWindowWrapper>
        <VideoJS
          url={streamVideoState.data.videoUrl}
          laURL={streamVideoState.data.laURL}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
        />
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: VideoJsPlayerOptions = {
  controls: false,
  muted: true,
};
