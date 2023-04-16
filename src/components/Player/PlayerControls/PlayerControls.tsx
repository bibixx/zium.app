import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { PlayerAPI, PlayerEvent, UserInteractionEvent } from "bitmovin-player";
import {
  Container,
  ControlBar,
  PlaybackTimeLabel,
  PlaybackTimeLabelMode,
  SeekBar,
  SeekBarLabel,
  UIContainer,
  UIManager,
} from "bitmovin-player-ui";

import { UIConfig } from "bitmovin-player-ui/dist/js/framework/uiconfig";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStateWithRef } from "../../../hooks/useStateWithRef/useStateWithRef";
import { Button } from "../../Button/Button";
import { ArrowLeft30Icon, ArrowRight30Icon } from "../../CustomIcons/CustomIcons";
import { Spinner } from "../../Spinner/Spinner";
import { OptionsButtons } from "./OptionsButtons/OptionsButtons";
import styles from "./PlayerControls.module.scss";

interface PlayerControlsProps {
  player: PlayerAPI | null;
  toggleCollapse: () => void;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
}

const OVERLAY_TIMEOUT_DELAY = 100;

export const PlayerControls = ({
  player,
  toggleCollapse,
  setVolume,
  volume,
  isMuted,
  setIsMuted,
}: PlayerControlsProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const $wrapper = wrapperRef.current;
    if (player === null || $wrapper === null) {
      return;
    }

    const seekBar = new SeekBar({
      label: new SeekBarLabel(),
      keyStepIncrements: {
        leftRight: 50,
        upDown: 50,
      },
    });

    const controlBar = new ControlBar({
      components: [
        new Container({
          components: [
            new PlaybackTimeLabel({
              timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
              cssClasses: ["current-time"],
              tabIndex: 0,
            }),
            new PlaybackTimeLabel({
              timeLabelMode: PlaybackTimeLabelMode.TotalTime,
              cssClasses: ["total-time"],
              hideInLivePlayback: true,
            }),
          ],
          cssClasses: ["controlbar-top"],
        }),
        new Container({
          components: [seekBar],
          cssClasses: ["controlbar-bottom"],
        }),
      ],
    });

    const myUi = new UIContainer({
      components: [controlBar],
      hideDelay: -1,
    });

    const myUiConfig: UIConfig = {
      container: $wrapper,
    };

    const myUiManager = new UIManager(player, myUi, myUiConfig);

    return () => {
      myUiManager.release();
    };
  }, [player]);

  return (
    <div className={styles.wrapper}>
      <PlaybackButtons player={player} />
      <div className={styles.bitmovinWrapper} ref={wrapperRef} />
      <OptionsButtons
        player={player}
        toggleCollapse={toggleCollapse}
        setVolume={setVolume}
        volume={volume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />
    </div>
  );
};

interface PlaybackButtonsProps {
  player: PlayerAPI | null;
}
const PlaybackButtons = ({ player }: PlaybackButtonsProps) => {
  const [isPlaying, isPlayingRef, setIsPlaying] = useStateWithRef(player?.isPlaying() ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedSeeking, setHasStartedSeeking] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [wasPlayingBeforeSeekStart, setWasPlayingBeforeSeekStart] = useState(false);

  useEffect(() => {
    if (player == null) {
      return;
    }

    setIsPlaying(player.isPlaying());
    player.on(PlayerEvent.Paused, (event: UserInteractionEvent) => {
      if (event.issuer === "ui-seek") {
        setWasPlayingBeforeSeekStart(isPlayingRef.current);
        setHasStartedSeeking(true);
      }

      setIsPlaying(player.isPlaying());
    });
    player.on(PlayerEvent.Play, (event: UserInteractionEvent) => {
      if (event.issuer === "ui-seek") {
        setHasStartedSeeking(false);
      }

      setIsPlaying(player.isPlaying());
    });
    player.on(PlayerEvent.Playing, () => setIsPlaying(player.isPlaying()));
    player.on(PlayerEvent.SourceLoaded, () => setIsPlaying(player.isPlaying()));
    player.on(PlayerEvent.SourceUnloaded, () => setIsPlaying(player.isPlaying()));
    player.on(PlayerEvent.PlaybackFinished, () => setIsPlaying(player.isPlaying()));
    player.on(PlayerEvent.CastStarted, () => setIsPlaying(player.isPlaying()));
    player.on(PlayerEvent.Seek, () => setIsSeeking(true));
    player.on(PlayerEvent.Seeked, () => setIsSeeking(false));
  }, [isPlayingRef, player, setIsPlaying, setIsSeeking]);

  useEffect(() => {
    if (player == null) {
      return;
    }

    let overlayTimeout = -1;
    const showOverlay = () => {
      clearTimeout(overlayTimeout);
      overlayTimeout = setTimeout(() => {
        setIsLoading(true);
      }, OVERLAY_TIMEOUT_DELAY);
    };
    const hideOverlay = () => {
      clearTimeout(overlayTimeout);
      setIsLoading(false);
    };
    player.on(PlayerEvent.StallStarted, showOverlay);
    player.on(PlayerEvent.StallEnded, hideOverlay);
    player.on(PlayerEvent.Play, showOverlay);
    player.on(PlayerEvent.Playing, hideOverlay);
    player.on(PlayerEvent.Paused, hideOverlay);
    player.on(PlayerEvent.Seek, showOverlay);
    player.on(PlayerEvent.Seeked, hideOverlay);
    player.on(PlayerEvent.TimeShift, showOverlay);
    player.on(PlayerEvent.TimeShifted, hideOverlay);
    player.on(PlayerEvent.SourceUnloaded, hideOverlay);

    return () => clearTimeout(overlayTimeout);
  }, [player]);

  const onPlayClick = () => {
    if (player == null) {
      return;
    }

    if (player.isPlaying()) {
      player.pause("ui");
    } else {
      player.play("ui");
    }
  };

  const onSkipAhead = () => {
    player?.seek(player.getCurrentTime() + 30);
  };

  const onSkipBackwards = () => {
    player?.seek(player.getCurrentTime() - 30);
  };

  const PlayPauseIcon = useMemo(() => {
    if (isLoading) {
      return Spinner;
    }

    const displayedIsPlaying = isSeeking || hasStartedSeeking ? wasPlayingBeforeSeekStart : isPlaying;
    return displayedIsPlaying ? PauseIcon : PlayIcon;
  }, [hasStartedSeeking, isLoading, isPlaying, isSeeking, wasPlayingBeforeSeekStart]);

  return (
    <div className={styles.buttonsWrapper}>
      <Button iconLeft={ArrowLeft30Icon} variant="Tertiary" onClick={onSkipBackwards} />
      <Button iconLeft={PlayPauseIcon} variant="Secondary" onClick={onPlayClick} />
      <Button iconLeft={ArrowRight30Icon} variant="Tertiary" onClick={onSkipAhead} />
    </div>
  );
};
