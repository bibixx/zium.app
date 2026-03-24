import { forwardRef, memo, useCallback, useRef, useState } from "react";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { BaseGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { setRef } from "../../../utils/setRef";
import { VideoPlayer } from "../../VideoPlayer/VideoPlayer";
import { VideoPlayerRef, VideoPlayerOptions } from "../../VideoPlayer/VideoPlayer.types";
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

interface DriverTrackerVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: (windowId: string) => void;
  onSourceChange: (windowId: string, data: ChosenValueType) => void;
}

export const DriverTrackerVideoWindow = memo(
  forwardRef<VideoPlayerRef | null, DriverTrackerVideoWindowProps>(
    ({ isPaused, streamUrl, onDelete, fillMode, updateFillMode, onSourceChange, gridWindow }, forwardedRef) => {
      const playerRef = useRef<VideoPlayerRef | null>(null);
      const streamVideoState = useStreamVideo(streamUrl);
      const [playerError, setPlayerError] = useState<unknown>(null);
      const { updateOffset } = useUserOffsets();
      const offsets = useReactiveUserOffsets();

      const ref = (r: VideoPlayerRef | null) => {
        setRef(forwardedRef, r);
        playerRef.current = r;
      };

      const { requestStream } = useStreamPicker();
      const onRequestSourceChange = async () => {
        const chosenData = await requestStream(["drivers", "data"], ["driver-tracker"]);

        if (chosenData == null) {
          return;
        }

        onSourceChange(gridWindow.id, chosenData);
      };
      const onOffsetChange = useCallback(
        (value: number) => {
          updateOffset("driver-tracker", value);
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
        return <NoFeed onDelete={() => onDelete(gridWindow.id)} />;
      }

      if (streamVideoState.state === "error") {
        return <FeedError error={streamVideoState.error} onDelete={() => onDelete(gridWindow.id)} />;
      }

      if (playerError != null) {
        return <FeedError error={playerError} onDelete={() => onDelete(gridWindow.id)} />;
      }

      return (
        <VideoWindowWrapper>
          <VideoPlayer
            videoStreamInfo={streamVideoState.data}
            options={ADDITIONAL_OPTIONS}
            ref={ref}
            onError={setPlayerError}
            isPaused={isPaused}
            isMuted
            fillMode={fillMode}
          />

          <VideoWindowButtonsTopLeftWrapper>
            <SourceButton
              onClick={onRequestSourceChange}
              label="Tracker"
              icon={getIconForStreamInfo("driver-tracker", "mini")}
              hideWhenUiHidden
            />
            <VideoWindowButtonsOffset
              onOffsetChange={onOffsetChange}
              currentOffset={offsets?.additionalStreams["driver-tracker"] ?? 0}
            />
          </VideoWindowButtonsTopLeftWrapper>
          <VideoWindowButtonsTopRightWrapper>
            <VideoWindowButtonsClose onClose={() => onDelete(gridWindow.id)} />
          </VideoWindowButtonsTopRightWrapper>
          <VideoWindowButtonsBottomRightWrapper>
            <VideoWindowButtonsUpdateFillMode
              updateFillMode={() => updateFillMode(gridWindow.id, fillMode === "fill" ? "fit" : "fill")}
              fillMode={fillMode}
            />
          </VideoWindowButtonsBottomRightWrapper>
        </VideoWindowWrapper>
      );
    },
  ),
);

const ADDITIONAL_OPTIONS: VideoPlayerOptions = {
  muted: true,
};
