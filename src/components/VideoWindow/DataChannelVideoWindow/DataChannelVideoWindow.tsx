import { forwardRef, useRef } from "react";
import { PlayerAPI } from "bitmovin-player";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { BaseGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../../utils/onVideoWindowReady";
import { setRef } from "../../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../../VideoJS/VideoJS";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import { VideoWindowButtons } from "../VideoWindowButtons/VideoWindowButtons";
import { useUserOffsets } from "../../../hooks/useUserOffests";

interface DataChannelVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: () => void;
}

export const DataChannelVideoWindow = forwardRef<PlayerAPI | null, DataChannelVideoWindowProps>(
  ({ gridWindow, isPaused, streamUrl, onDelete, fillMode, updateFillMode }, forwardedRef) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const { updateOffset } = useUserOffsets();

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: PlayerAPI) => {
      onVideoWindowReadyBase(player);
    };

    if (streamVideoState.state === "loading") {
      return null;
    }

    if (
      streamVideoState.state === "error" &&
      streamVideoState.error instanceof StreamVideoError &&
      streamVideoState.error.type === "NO_PLAYBACK_URL"
    ) {
      return <NoFeed onDelete={onDelete} />;
    }

    if (streamVideoState.state === "error") {
      return <FeedError error={streamVideoState.error} onDelete={onDelete} />;
    }

    return (
      <VideoWindowWrapper>
        <VideoJS
          videoStreamInfo={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
          fillMode={fillMode}
        />
        <VideoWindowButtons
          onOffsetChange={(value) => {
            updateOffset(gridWindow.id, value);
          }}
          updateFillMode={() => updateFillMode(fillMode === "fill" ? "fit" : "fill")}
          fillMode={fillMode}
          onClose={onDelete}
        />
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: AdditionalVideoJSOptions = {
  ui: false,
  playback: {
    muted: true,
  },
};
