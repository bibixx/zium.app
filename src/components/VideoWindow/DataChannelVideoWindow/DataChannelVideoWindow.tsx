import { forwardRef, useCallback, useRef } from "react";
import { PlayerAPI } from "bitmovin-player";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { BaseGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { setRef } from "../../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../../VideoJS/VideoJS";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import {
  VideoWindowButtonsBottomRightWrapper,
  VideoWindowButtonsClose,
  VideoWindowButtonsOffset,
  VideoWindowButtonsTopLeftWrapper,
  VideoWindowButtonsTopRightWrapper,
  VideoWindowButtonsUpdateFillMode,
} from "../VideoWindowButtons/VideoWindowButtons";
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { SourceButton } from "../../SourceButton/SourceButton";
import { getIconForStreamInfo } from "../../../utils/getIconForStreamInfo";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";

interface DataChannelVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: () => void;
  onSourceChange: (streamId: string, chosenValueType: ChosenValueType) => void;
}

export const DataChannelVideoWindow = forwardRef<PlayerAPI | null, DataChannelVideoWindowProps>(
  ({ isPaused, streamUrl, onDelete, fillMode, updateFillMode, onSourceChange }, forwardedRef) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const { updateOffset } = useUserOffsets();
    const offsets = useReactiveUserOffsets();

    const { requestStream } = useStreamPicker();
    const onRequestSourceChange = async () => {
      const chosenDriverData = await requestStream(["drivers", "global"], ["data-channel"]);

      if (chosenDriverData == null) {
        return;
      }

      const [chosenStreamId, chosenValueType] = chosenDriverData;
      onSourceChange(chosenStreamId, chosenValueType);
    };

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onOffsetChange = useCallback(
      (value: number) => {
        updateOffset("data-channel", value);
      },
      [updateOffset],
    );

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
          isPaused={isPaused}
          fillMode={fillMode}
        />
        <VideoWindowButtonsTopLeftWrapper>
          <SourceButton
            onClick={onRequestSourceChange}
            label="Data"
            icon={getIconForStreamInfo("data-channel", "mini")}
            hideWhenUiHidden
          />
          <VideoWindowButtonsOffset
            onOffsetChange={onOffsetChange}
            currentOffset={offsets?.additionalStreams["data-channel"] ?? 0}
            usesZiumOffsets={offsets?.isUserDefined === false}
          />
        </VideoWindowButtonsTopLeftWrapper>
        <VideoWindowButtonsTopRightWrapper>
          <VideoWindowButtonsClose onClose={onDelete} />
        </VideoWindowButtonsTopRightWrapper>
        <VideoWindowButtonsBottomRightWrapper>
          <VideoWindowButtonsUpdateFillMode
            updateFillMode={() => updateFillMode(fillMode === "fill" ? "fit" : "fill")}
            fillMode={fillMode}
          />
        </VideoWindowButtonsBottomRightWrapper>
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
