import { forwardRef, useRef } from "react";
import { PlayerAPI } from "bitmovin-player";
import { SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../../utils/onVideoWindowReady";
import { setRef } from "../../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../../VideoJS/VideoJS";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { DriverData } from "../../../views/Viewer/Viewer.utils";
import { useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { VideoFeedContent } from "../../VideoFeedContent/VideoFeedContent";
import closeButtonStyles from "../VideoWindow.module.scss";
import styles from "./DriverVideoWindow.module.scss";

interface DriverVideoWindowProps extends VideoWindowProps {
  gridWindow: DriverGridWindow;
  availableDrivers: DriverData[];
  onDriverChange: (streamIdentifier: string) => void;
  isAudioFocused: boolean;
  onWindowAudioFocus: () => void;
  volume: number;
  onDelete: () => void;
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
      volume,
      onDelete,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const currentDriver = availableDrivers.find((driver) => driver.id === gridWindow.driverId);

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: PlayerAPI) => {
      onVideoWindowReadyBase(player);
    };

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onDriverChange(e.target.value);
    };

    if (streamVideoState.state === "loading") {
      return null;
    }

    if (streamVideoState.state === "error") {
      return <div style={{ color: "white" }}>{streamVideoState.error}</div>;
    }

    return (
      <VideoWindowWrapper className={styles.bitmovinWrapper}>
        <VideoJS
          videoStreamInfo={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
          volume={isAudioFocused ? volume : 0}
        />
        <DriverPickerButton currentDriver={currentDriver} onDriverChange={onDriverChange} />
        <button
          className={cn(styles.focusAudioButton, { [styles.isAudioFocused]: isAudioFocused })}
          onClick={onWindowAudioFocus}
        >
          <SpeakerWaveIcon width={20} height={20} fill="currentColor" />
        </button>
        <button className={closeButtonStyles.closeButton} onClick={onDelete}>
          <XMarkIcon width={20} height={20} fill="currentColor" />
        </button>
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

  if (currentDriver == null) {
    return null;
  }

  const onClick = async () => {
    const chosenDriver = await requestStream("drivers", [currentDriver.id]);

    if (chosenDriver == null) {
      return;
    }

    onDriverChange(chosenDriver);
  };

  return (
    <button
      className={styles.driverName}
      onClick={onClick}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <VideoFeedContent
        label={currentDriver.lastName}
        topLabel={currentDriver.firstName}
        imageSrc={currentDriver.imageUrl}
      />
    </button>
  );
};
