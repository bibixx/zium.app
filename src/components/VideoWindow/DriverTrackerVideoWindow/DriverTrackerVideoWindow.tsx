import { PlayerAPI } from "bitmovin-player";
import { forwardRef, useRef } from "react";
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
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests";

interface DriverTrackerVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: () => void;
}

export const DriverTrackerVideoWindow = forwardRef<PlayerAPI | null, DriverTrackerVideoWindowProps>(
  ({ isPaused, streamUrl, onDelete, fillMode, updateFillMode }, forwardedRef) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const { updateOffset } = useUserOffsets();
    const offsets = useReactiveUserOffsets();

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
            updateOffset("driver-tracker", value);
          }}
          currentOffset={offsets["driver-tracker"] ?? 0}
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