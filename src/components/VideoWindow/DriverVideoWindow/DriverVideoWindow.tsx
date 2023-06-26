import { forwardRef, useRef } from "react";
import { PlayerAPI } from "bitmovin-player";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../../utils/onVideoWindowReady";
import { setRef } from "../../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../../VideoJS/VideoJS";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { DriverData } from "../../../views/Viewer/Viewer.utils";
import { useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { VideoWindowButtons } from "../VideoWindowButtons/VideoWindowButtons";
import { SourceButton } from "../../SourceButton/SourceButton";

interface DriverVideoWindowProps extends VideoWindowProps {
  gridWindow: DriverGridWindow;
  availableDrivers: DriverData[];
  onDriverChange: (streamIdentifier: string) => void;
  isAudioFocused: boolean;
  onWindowAudioFocus: () => void;
  focusMainWindow: () => void;
  volume: number;
  onDelete: () => void;
  hasOnlyOneStream: boolean;
}

export const DriverVideoWindow = forwardRef<PlayerAPI | null, DriverVideoWindowProps>(
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
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const currentDriver = availableDrivers.find((driver) => driver.id === gridWindow.driverId);
    const { updateOffset } = useUserOffsets();
    const offsets = useReactiveUserOffsets();

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onAudioFocusClick = () => {
      if (isAudioFocused) {
        focusMainWindow();
      } else {
        onWindowAudioFocus();
      }
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
      return (
        <NoFeed onDelete={onDelete}>
          {!hasOnlyOneStream && <DriverPickerButton currentDriver={currentDriver} onDriverChange={onDriverChange} />}
        </NoFeed>
      );
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
          volume={isAudioFocused ? volume : 0}
          fillMode={fillMode}
        />
        {!hasOnlyOneStream && <DriverPickerButton currentDriver={currentDriver} onDriverChange={onDriverChange} />}

        <VideoWindowButtons
          onOffsetChange={(value) => {
            updateOffset(gridWindow.driverId, value);
          }}
          currentOffset={offsets?.additionalStreams[gridWindow.driverId] ?? 0}
          updateFillMode={() => updateFillMode(fillMode === "fill" ? "fit" : "fill")}
          fillMode={fillMode}
          onAudioFocusClick={onAudioFocusClick}
          isAudioFocused={isAudioFocused}
          onClose={onDelete}
        />
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: AdditionalVideoJSOptions = {
  ui: false,
  playback: {
    audioLanguage: ["teamradio"],
  },
};

interface DriverPickerButtonProps {
  currentDriver: DriverData | undefined;
  onDriverChange: (streamIdentifier: string) => void;
}
const DriverPickerButton = ({ currentDriver, onDriverChange }: DriverPickerButtonProps) => {
  const { requestStream } = useStreamPicker();

  const currentDriverId = currentDriver?.id;
  const lastName = currentDriver?.id;
  const imageUrls = currentDriver?.imageUrls;

  const onClick = async () => {
    const chosenDriverData = await requestStream("all", currentDriverId === undefined ? [] : [currentDriverId]);

    if (chosenDriverData == null) {
      return;
    }

    const [chosenDriverId] = chosenDriverData;
    onDriverChange(chosenDriverId);
  };

  return (
    <SourceButton
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      label={lastName}
      srcList={imageUrls}
      showPlaceholder={imageUrls === undefined}
      color={currentDriver?.color}
    />
  );
};
