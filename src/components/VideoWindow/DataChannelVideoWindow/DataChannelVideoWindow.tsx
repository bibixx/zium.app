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
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { SourceButton } from "../../SourceButton/SourceButton";
import { getIconForStreamInfo } from "../../../utils/getIconForStreamInfo";
import { useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";

interface DataChannelVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: () => void;
  onSourceChange: (streamId: string) => void;
}

export const DataChannelVideoWindow = forwardRef<PlayerAPI | null, DataChannelVideoWindowProps>(
  ({ isPaused, streamUrl, onDelete, fillMode, updateFillMode, onSourceChange }, forwardedRef) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const { updateOffset } = useUserOffsets();
    const offsets = useReactiveUserOffsets();

    const { requestStream } = useStreamPicker();
    const onRequestSourceChange = async () => {
      const chosenDriverData = await requestStream("all", ["data-channel"]);

      if (chosenDriverData == null) {
        return;
      }

      const [chosenStreamId] = chosenDriverData;

      onSourceChange(chosenStreamId);
    };

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
        <SourceButton
          onClick={onRequestSourceChange}
          onMouseDown={(e) => e.stopPropagation()}
          label="Data"
          icon={getIconForStreamInfo("data-channel", "mini")}
          hideWhenUiHidden
        />
        <VideoWindowButtons
          onOffsetChange={(value) => {
            updateOffset("data-channel", value);
          }}
          currentOffset={offsets?.additionalStreams["data-channel"] ?? 0}
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
