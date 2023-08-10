import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { PlayerAPI, PlayerEvent, PlayerEventCallback, UserInteractionEvent } from "bitmovin-player";
import {
  Container,
  ControlBar,
  Label,
  PlaybackTimeLabel,
  PlaybackTimeLabelMode,
  SeekBar,
  SeekBarLabel,
  UIContainer,
  UIManager,
} from "bitmovin-player-ui";

import { UIConfig } from "bitmovin-player-ui/dist/js/framework/uiconfig";
import cn from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStateWithRef } from "../../../hooks/useStateWithRef/useStateWithRef";
import { Button } from "../../Button/Button";
import { ArrowLeft30Icon, ArrowRight30Icon } from "../../CustomIcons/CustomIcons";
import { Spinner } from "../../Spinner/Spinner";
import { assertNever } from "../../../utils/assertNever";
import { isBitmovinPlayerDestroyed } from "../../../utils/isBitmovinPlayerDestroyed";
import { OptionsButtons } from "./OptionsButtons/OptionsButtons";
import styles from "./PlayerControls.module.scss";

interface PlayerControlsProps {
  player: PlayerAPI;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
}

const OVERLAY_TIMEOUT_DELAY = 100;

export const PlayerControls = ({ player, setVolume, volume, isMuted, setIsMuted }: PlayerControlsProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(
    isBitmovinPlayerDestroyed(player) ? false : player.getBufferedRanges().length > 0,
  );

  useEffect(() => {
    const $wrapper = wrapperRef.current;
    if ($wrapper === null) {
      return;
    }

    const seekBar = new SeekBar({
      label: new SeekBarLabel(),
      keyStepIncrements: {
        leftRight: 5,
        upDown: 5,
      },
    });

    const currentTimeLabelWrapper = new Container({
      components: [
        new Label({
          text: "--:--",
          cssClasses: ["label-placeholder"],
        }),
        new PlaybackTimeLabel({
          timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
        }),
      ],
      cssClasses: ["current-time", "time-wrapper"],
    });

    const totalTimeLabelWrapper = new Container({
      components: [
        new Label({
          text: "--:--",
          cssClasses: ["label-placeholder"],
        }),
        new PlaybackTimeLabel({
          timeLabelMode: PlaybackTimeLabelMode.TotalTime,
          hideInLivePlayback: true,
        }),
      ],
      cssClasses: ["total-time", "time-wrapper"],
    });

    const controlBar = new ControlBar({
      components: [
        new Container({
          components: [currentTimeLabelWrapper, totalTimeLabelWrapper],
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

    player.on(PlayerEvent.Ready, () => {
      setIsReady(true);
    });

    return () => {
      myUiManager.release();
    };
  }, [player]);

  return (
    <div className={cn(styles.wrapper)}>
      <PlaybackButtons player={isBitmovinPlayerDestroyed(player) ? undefined : player} isReady={isReady} />
      <div
        className={cn(styles.bitmovinWrapper, { [styles.isReady]: isReady })}
        ref={wrapperRef}
        inert={!isReady ? "" : undefined}
      />
      <OptionsButtons player={player} setVolume={setVolume} volume={volume} isMuted={isMuted} setIsMuted={setIsMuted} />
    </div>
  );
};

interface PlaybackButtonsProps {
  player: PlayerAPI | undefined;
  isReady: boolean;
}
const PlaybackButtons = ({ player, isReady }: PlaybackButtonsProps) => {
  const [isPlaying, isPlayingRef, setIsPlaying] = useStateWithRef(player?.isPlaying() ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnLiveEdge, setIsOnLiveEdge] = useState(player?.isLive());
  const [hasStartedSeeking, setHasStartedSeeking] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [wasPlayingBeforeSeekStart, setWasPlayingBeforeSeekStart] = useState(false);

  useEffect(() => {
    if (player == null) {
      return;
    }

    setIsPlaying(player.isPlaying());
    return setupEvents(player, {
      [PlayerEvent.Paused]: (event: UserInteractionEvent) => {
        if (event.issuer === "ui-seek") {
          setWasPlayingBeforeSeekStart(isPlayingRef.current);
          setHasStartedSeeking(true);
        }

        setIsPlaying(player.isPlaying());
      },
      [PlayerEvent.Play]: (event: UserInteractionEvent) => {
        if (event.issuer === "ui-seek") {
          setHasStartedSeeking(false);
        }

        setIsPlaying(player.isPlaying());
      },
      [PlayerEvent.Playing]: () => setIsPlaying(player.isPlaying()),
      [PlayerEvent.SourceLoaded]: () => setIsPlaying(player.isPlaying()),
      [PlayerEvent.SourceUnloaded]: () => setIsPlaying(player.isPlaying()),
      [PlayerEvent.PlaybackFinished]: () => setIsPlaying(player.isPlaying()),
      [PlayerEvent.CastStarted]: () => setIsPlaying(player.isPlaying()),
      [PlayerEvent.Seek]: () => setIsSeeking(true),
      [PlayerEvent.Seeked]: () => setIsSeeking(false),
    });
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

    const eventsCleanup = setupEvents(player, {
      [PlayerEvent.StallStarted]: showOverlay,
      [PlayerEvent.StallEnded]: hideOverlay,
      [PlayerEvent.Play]: showOverlay,
      [PlayerEvent.Playing]: hideOverlay,
      [PlayerEvent.Paused]: hideOverlay,
      [PlayerEvent.Seek]: showOverlay,
      [PlayerEvent.Seeked]: hideOverlay,
      [PlayerEvent.TimeShift]: showOverlay,
      [PlayerEvent.TimeShifted]: hideOverlay,
      [PlayerEvent.SourceUnloaded]: hideOverlay,
    });

    return () => {
      eventsCleanup();
      clearTimeout(overlayTimeout);
    };
  }, [player]);

  useEffect(() => {
    if (player == null || !player.isLive()) {
      return;
    }

    const updateLiveTimeshiftState = () => {
      const isTimeshifted = player.getTimeShift() < 0;
      const isTimeshiftAvailable = player.getMaxTimeShift() < 0;
      const isOnLiveEdge = !isTimeshifted && (!player.isPaused() || !isTimeshiftAvailable);
      setIsOnLiveEdge(isOnLiveEdge);
    };

    updateLiveTimeshiftState();

    return setupEvents(player, {
      [PlayerEvent.TimeShift]: updateLiveTimeshiftState,
      [PlayerEvent.TimeShifted]: updateLiveTimeshiftState,
      [PlayerEvent.Playing]: updateLiveTimeshiftState,
      [PlayerEvent.Paused]: updateLiveTimeshiftState,
      [PlayerEvent.StallStarted]: updateLiveTimeshiftState,
      [PlayerEvent.StallEnded]: updateLiveTimeshiftState,
    });
  }, [player]);

  const onPlayClick = useCallback(() => {
    if (player == null) {
      return;
    }

    if (player.isPlaying()) {
      player.pause("ui");
    } else {
      player.play("ui");
    }
  }, [player]);

  const onSkipAhead = useCallback(() => {
    if (player == null) {
      return;
    }

    if (player.isLive()) {
      player.timeShift(player.getTimeShift() + 30);
    } else {
      player.seek(player.getCurrentTime() + 30);
    }
  }, [player]);

  const onSkipBackwards = useCallback(() => {
    if (player == null) {
      return;
    }

    if (player.isLive()) {
      player.timeShift(player.getTimeShift() - 30);
    } else {
      player.seek(player.getCurrentTime() - 30);
    }
  }, [player]);

  const playPauseState = useMemo(() => {
    if (isLoading || !isReady) {
      return "buffering";
    }

    const displayedIsPlaying = isSeeking || hasStartedSeeking ? wasPlayingBeforeSeekStart : isPlaying;
    return displayedIsPlaying ? "pause" : "play";
  }, [hasStartedSeeking, isLoading, isPlaying, isReady, isSeeking, wasPlayingBeforeSeekStart]);

  const PlayPauseIcon = useMemo(() => {
    if (playPauseState === "buffering") {
      return Spinner;
    }

    if (playPauseState === "pause") {
      return PauseIcon;
    }

    if (playPauseState === "play") {
      return PlayIcon;
    }

    return assertNever(playPauseState);
  }, [playPauseState]);

  const playPauseAriaLabel = useMemo(() => {
    if (playPauseState === "buffering") {
      return "Buffering";
    }

    if (playPauseState === "pause") {
      return "Pause";
    }

    if (playPauseState === "play") {
      return "Play";
    }

    return assertNever(playPauseState);
  }, [playPauseState]);

  return (
    <div className={styles.buttonsWrapper}>
      <Button
        iconLeft={ArrowLeft30Icon}
        variant="Tertiary"
        onClick={onSkipBackwards}
        disabled={!isReady}
        aria-label="Skip backward"
      />
      <Button iconLeft={PlayPauseIcon} variant="Secondary" onClick={onPlayClick} aria-label={playPauseAriaLabel} />
      <Button
        iconLeft={ArrowRight30Icon}
        variant="Tertiary"
        onClick={onSkipAhead}
        disabled={isOnLiveEdge || !isReady}
        aria-label="Skip forward"
      />
    </div>
  );
};

const setupEvents = (player: PlayerAPI, eventMap: Partial<Record<PlayerEvent, PlayerEventCallback>>) => {
  Object.entries(eventMap).map(([e, callback]) => {
    player.on(e as PlayerEvent, callback);
  });

  return () => {
    if (!isBitmovinPlayerDestroyed(player)) {
      Object.entries(eventMap).map(([e, callback]) => {
        player.off(e as PlayerEvent, callback);
      });
    }
  };
};
