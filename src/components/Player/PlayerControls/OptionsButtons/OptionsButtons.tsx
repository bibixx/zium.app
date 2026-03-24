import {
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useState, useEffect, useCallback } from "react";
import whatInput from "what-input";
import { Button } from "../../../Button/Button";
import { toggleFullScreen } from "../../../../utils/toggleFullScreen";
import { useHotkeys } from "../../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../../hooks/useHotkeys/useHotkeys.keys";
import { VideoPlayerRef } from "../../../VideoPlayer/VideoPlayer.types";
import { VolumeSlider } from "./VolumeSlider";
import styles from "./OptionsButtons.module.scss";

interface OptionsButtonsProps {
  playerRef: VideoPlayerRef;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
}
export const OptionsButtons = ({ volume, setVolume, isMuted, setIsMuted }: OptionsButtonsProps) => {
  const [isFullScreen, setIsFullScreen] = useState(document.fullscreenElement != null);
  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);

    return () => document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  return (
    <div className={styles.buttonsWrapper}>
      <VolumeButton volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} />
      <Button
        iconLeft={isFullScreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon}
        variant="Tertiary"
        onClick={toggleFullScreen}
        aria-label="Toggle full screen"
      />
    </div>
  );
};

interface VolumeButtonProps {
  isMuted: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
  setIsMuted: (newIsMuted: boolean) => void;
}
const VolumeButton = ({ volume, setVolume, isMuted, setIsMuted }: VolumeButtonProps) => {
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDragScrubbing, setIsDragScrubbing] = useState(false);

  const onDecreaseVolume = useCallback(() => {
    setVolume(volume - 1);
  }, [setVolume, volume]);
  const onIncreaseVolume = useCallback(() => {
    setVolume(volume + 1);
  }, [setVolume, volume]);
  const onToggleMuted = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted, setIsMuted]);

  useHotkeys(
    () => ({
      id: "VolumeButton",
      enabled: isFocusWithin,
      allowPropagation: false,
      hotkeys: [
        {
          keys: SHORTCUTS.FOCUSED_VOLUME_DOWN,
          action: onDecreaseVolume,
        },
        {
          keys: SHORTCUTS.FOCUSED_VOLUME_UP,
          action: onIncreaseVolume,
        },
        {
          keys: SHORTCUTS.TOGGLE_MUTE,
          action: onToggleMuted,
        },
      ],
    }),
    [onDecreaseVolume, onIncreaseVolume, isFocusWithin, onToggleMuted],
  );

  return (
    <div
      className={classNames(styles.volumeWrapper, { [styles.isFocusWithin]: isFocusWithin || isDragScrubbing })}
      onFocus={() => {
        const isFocusVisible = whatInput.ask("input") === "keyboard";

        if (isFocusVisible) {
          setIsFocusWithin(true);
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocusWithin(false);
        }
      }}
    >
      <div className={styles.volumeButtonWrapper}>
        <Button
          iconLeft={isMuted ? SpeakerXMarkIcon : SpeakerWaveIcon}
          variant="Tertiary"
          onClick={() => setIsMuted(!isMuted)}
          aria-label={isMuted ? "Unmute" : "Mute"}
        />
      </div>
      <div className={styles.volumeSliderContainer}>
        <div className={styles.volumeSliderWrapper}>
          <VolumeSlider volume={volume} setVolume={setVolume} onScrubbingChange={setIsDragScrubbing} />
        </div>
      </div>
    </div>
  );
};
