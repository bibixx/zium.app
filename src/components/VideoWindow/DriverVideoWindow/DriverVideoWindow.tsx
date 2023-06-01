import { forwardRef, useRef } from "react";
import { PlayerAPI } from "bitmovin-player";
import { ExclamationCircleIcon, SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
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
import { Button } from "../../Button/Button";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import styles from "./DriverVideoWindow.module.scss";

interface DriverVideoWindowProps extends VideoWindowProps {
  gridWindow: DriverGridWindow;
  availableDrivers: DriverData[];
  onDriverChange: (streamIdentifier: string) => void;
  isAudioFocused: boolean;
  onWindowAudioFocus: () => void;
  focusMainWindow: () => void;
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
      focusMainWindow,
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
        <VideoWindowWrapper className={styles.bitmovinWrapper}>
          <div className={styles.noFeedIconWrapper}>
            <EyeSlashIcon height={36} width={36} />
          </div>
          <DriverPickerButton currentDriver={currentDriver} onDriverChange={onDriverChange} />
          <div className={closeButtonStyles.closeButtonWrapper}>
            <Button variant="SecondaryInverted" onClick={onDelete} iconLeft={XMarkIcon} />
          </div>
        </VideoWindowWrapper>
      );
    }

    if (streamVideoState.state === "error") {
      return (
        <VideoWindowWrapper className={styles.bitmovinWrapper}>
          <div className={styles.errorContent}>
            <div className={styles.errorIconContainer}>
              <ExclamationCircleIcon height={36} width={36} />
            </div>
            <div>{streamVideoState.error.message}</div>
          </div>
          <div className={closeButtonStyles.closeButtonWrapper}>
            <Button variant="SecondaryInverted" onClick={onDelete} iconLeft={XMarkIcon} />
          </div>
        </VideoWindowWrapper>
      );
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
        <div className={styles.focusAudioButtonWrapper} onMouseDown={(e) => e.stopPropagation()}>
          <Button
            variant="SecondaryInverted"
            className={cn({ [styles.isAudioFocused]: isAudioFocused })}
            onClick={onAudioFocusClick}
            iconLeft={SpeakerWaveIcon}
          />
        </div>
        <div className={closeButtonStyles.closeButtonWrapper} onMouseDown={(e) => e.stopPropagation()}>
          <Button variant="SecondaryInverted" onClick={onDelete} iconLeft={XMarkIcon} />
        </div>
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
  const lastName = currentDriver?.lastName ?? (
    <>
      Select
      <br />
      source
    </>
  );
  const firstName = currentDriver?.firstName ?? "";
  const imageUrls = currentDriver?.imageUrls;

  const onClick = async () => {
    const chosenDriverData = await requestStream("drivers", currentDriverId === undefined ? [] : [currentDriverId]);

    if (chosenDriverData == null) {
      return;
    }

    const [chosenDriverId, chosenType] = chosenDriverData;
    if (chosenType !== "driver") {
      return;
    }

    onDriverChange(chosenDriverId);
  };

  return (
    <button className={styles.driverName} onClick={onClick} onMouseDown={(e) => e.stopPropagation()}>
      <VideoFeedContent
        label={lastName}
        topLabel={firstName}
        srcList={imageUrls}
        showPlaceholder={imageUrls === undefined}
      />
    </button>
  );
};
