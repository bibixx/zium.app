import { forwardRef, memo, useCallback, useRef, useState } from "react";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { setRef } from "../../../utils/setRef";
import { VideoPlayer } from "../../VideoPlayer/VideoPlayer";
import { VideoPlayerRef, VideoPlayerOptions } from "../../VideoPlayer/VideoPlayer.types";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { DriverData } from "../../../views/Viewer/Viewer.utils";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import {
  VideoWindowButtonsBottomRightWrapper,
  VideoWindowButtonsClose,
  VideoWindowButtonsOffset,
  VideoWindowButtonsOnAudioFocusClick,
  VideoWindowButtonsTopLeftWrapper,
  VideoWindowButtonsTopRightWrapper,
  VideoWindowButtonsUpdateFillMode,
} from "../VideoWindowButtons/VideoWindowButtons";
import { SourceButton } from "../../SourceButton/SourceButton";

interface DriverVideoWindowProps extends VideoWindowProps {
  gridWindow: DriverGridWindow;
  availableDrivers: DriverData[];
  onDriverChange: (windowId: string, data: ChosenValueType) => void;
  isAudioFocused: boolean;
  onWindowAudioFocus: (windowId: string) => void;
  focusMainWindow: () => void;
  volume: number;
  onDelete: (windowId: string) => void;
  hasOnlyOneStream: boolean;
}

export const DriverVideoWindow = memo(
  forwardRef<VideoPlayerRef | null, DriverVideoWindowProps>(
    (
      {
        gridWindow,
        streamUrl,
        availableDrivers,
        onDriverChange,
        isPaused,
        isAudioFocused,
        onWindowAudioFocus,
        focusMainWindow,
        volume,
        onDelete,
        hasOnlyOneStream,
        fillMode,
        updateFillMode,
      },
      forwardedRef,
    ) => {
      const playerRef = useRef<VideoPlayerRef | null>(null);
      const streamVideoState = useStreamVideo(streamUrl);
      const [playerError, setPlayerError] = useState<unknown>(null);
      const currentDriver = availableDrivers.find((driver) => driver.id === gridWindow.driverId);
      const { updateOffset } = useUserOffsets();
      const offsets = useReactiveUserOffsets();

      const ref = (r: VideoPlayerRef | null) => {
        setRef(forwardedRef, r);
        playerRef.current = r;
      };

      const onAudioFocusClick = () => {
        if (isAudioFocused) {
          focusMainWindow();
        } else {
          onWindowAudioFocus(gridWindow.id);
        }
      };

      const onOffsetChange = useCallback(
        (value: number) => {
          updateOffset(gridWindow.driverId, value);
        },
        [gridWindow.driverId, updateOffset],
      );

      if (streamVideoState.state === "loading") {
        return null;
      }

      if (
        streamVideoState.state === "error" &&
        streamVideoState.error instanceof StreamVideoError &&
        streamVideoState.error.type === "NO_PLAYBACK_URL"
      ) {
        return (
          <NoFeed onDelete={() => onDelete(gridWindow.id)}>
            {!hasOnlyOneStream && (
              <VideoWindowButtonsTopLeftWrapper>
                <DriverPickerButton
                  currentDriver={currentDriver}
                  onDriverChange={(data) => onDriverChange(gridWindow.id, data)}
                />
              </VideoWindowButtonsTopLeftWrapper>
            )}
          </NoFeed>
        );
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
            volume={isAudioFocused ? volume : 0}
            fillMode={fillMode}
          />

          <VideoWindowButtonsTopLeftWrapper>
            {!hasOnlyOneStream && (
              <DriverPickerButton
                currentDriver={currentDriver}
                onDriverChange={(data) => onDriverChange(gridWindow.id, data)}
              />
            )}
            <VideoWindowButtonsOffset
              onOffsetChange={onOffsetChange}
              currentOffset={offsets?.additionalStreams[gridWindow.driverId] ?? 0}
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
            <VideoWindowButtonsOnAudioFocusClick
              onAudioFocusClick={onAudioFocusClick}
              isAudioFocused={isAudioFocused}
            />
          </VideoWindowButtonsBottomRightWrapper>
        </VideoWindowWrapper>
      );
    },
  ),
);

const ADDITIONAL_OPTIONS: VideoPlayerOptions = {
  audioLanguage: ["teamradio"],
};

interface DriverPickerButtonProps {
  currentDriver: DriverData | undefined;
  onDriverChange: (data: ChosenValueType) => void;
}
const DriverPickerButton = ({ currentDriver, onDriverChange }: DriverPickerButtonProps) => {
  const { requestStream } = useStreamPicker();

  const currentDriverId = currentDriver?.id;
  const lastName = currentDriver?.id ?? "Select source";
  const imageUrls = currentDriver?.imageUrls;

  const onClick = async () => {
    const chosenDriverData = await requestStream(
      ["drivers", "data"],
      currentDriverId === undefined ? [] : [currentDriverId],
    );

    if (chosenDriverData == null) {
      return;
    }

    onDriverChange(chosenDriverData);
  };

  return (
    <SourceButton
      onClick={onClick}
      label={lastName}
      srcList={imageUrls}
      showPlaceholder={imageUrls === undefined}
      color={currentDriver?.color}
    />
  );
};
