import {
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/20/solid";
import { PlayerAPI, UIConfig } from "bitmovin-player";
import { UIContainer, UIManager, SeekBarLabel } from "bitmovin-player-ui";
import classNames from "classnames";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../../Button/Button";
import { toggleFullScreen } from "../../../../utils/toggleFullScreen";
import { useHotkeys } from "../../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../../hooks/useHotkeys/useHotkeys.keys";
import { CustomVolumeSlider } from "./CustomVolumeSlider";
import styles from "./OptionsButtons.module.scss";

interface OptionsButtonsProps {
  player: PlayerAPI | null;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
}
export const OptionsButtons = ({ player, volume, setVolume, isMuted, setIsMuted }: OptionsButtonsProps) => {
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
      <VolumeButton volume={volume} setVolume={setVolume} player={player} isMuted={isMuted} setIsMuted={setIsMuted} />
      <Button
        iconLeft={isFullScreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon}
        variant="Tertiary"
        onClick={toggleFullScreen}
      />
    </div>
  );
};

interface VolumeButtonProps {
  player: PlayerAPI | null;
  isMuted: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
  setIsMuted: (newIsMuted: boolean) => void;
}
const VolumeButton = ({ player, volume, setVolume, isMuted, setIsMuted }: VolumeButtonProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const volumeSliderRef = useRef<CustomVolumeSlider | null>(null);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDragScrubbing, setIsDragScrubbing] = useState(false);

  useEffect(() => {
    const $wrapper = wrapperRef.current;
    if (player === null || $wrapper === null) {
      return;
    }

    const volumeSlider = new CustomVolumeSlider(
      {
        vertical: false,
        label: new SeekBarLabel(),
        cssClass: "ui-volumeslider",
      },
      setVolume,
    );

    const myUi = new UIContainer({
      components: [volumeSlider],
      hideDelay: -1,
    });

    const myUiConfig: UIConfig = {
      container: $wrapper,
    };

    const myUiManager = new UIManager(player, myUi, myUiConfig);

    volumeSlider.setPlaybackPosition(volume);
    volumeSliderRef.current = volumeSlider;

    volumeSlider.onSeeked.subscribe(() => {
      setIsDragScrubbing(false);
    });
    volumeSlider.onSeekPreview.subscribe((_, args) => {
      if (args.scrubbing) {
        setIsDragScrubbing(true);
      }
    });

    return () => {
      myUiManager.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, setVolume]);

  useEffect(() => {
    volumeSliderRef.current?.setPlaybackPosition(volume);
  }, [volume]);

  const onDecreaseVolume = useCallback(() => {
    setVolume(volume - 1);
  }, [setVolume, volume]);
  const onIncreaseVolume = useCallback(() => {
    setVolume(volume + 1);
  }, [setVolume, volume]);
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
      ],
    }),
    [onDecreaseVolume, onIncreaseVolume, isFocusWithin],
  );

  return (
    <div
      className={classNames(styles.volumeWrapper, { [styles.isFocusWithin]: isFocusWithin || isDragScrubbing })}
      onFocus={(e) => {
        const isFocusVisible = e.currentTarget.querySelector(":focus-visible") !== null;

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
        />
      </div>
      <div className={styles.volumeSliderContainer}>
        <div ref={wrapperRef} className={styles.volumeSliderWrapper} />
      </div>
    </div>
  );
};
