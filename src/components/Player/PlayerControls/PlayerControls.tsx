import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStateWithRef } from "../../../hooks/useStateWithRef/useStateWithRef";
import { Button } from "../../Button/Button";
import { ArrowLeft30Icon, ArrowRight30Icon } from "../../CustomIcons/CustomIcons";
import { Spinner } from "../../Spinner/Spinner";
import { assertNever } from "../../../utils/assertNever";
import { VideoPlayerRef } from "../../VideoPlayer/VideoPlayer.types";
import { OptionsButtons } from "./OptionsButtons/OptionsButtons";
import { Seekbar } from "./Seekbar/Seekbar";
import styles from "./PlayerControls.module.scss";

interface PlayerControlsProps {
  playerRef: VideoPlayerRef;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
}

const OVERLAY_TIMEOUT_DELAY = 100;

export const PlayerControls = ({ playerRef, setVolume, volume, isMuted, setIsMuted }: PlayerControlsProps) => {
  const { video } = playerRef;
  const [isReady, setIsReady] = useState(video.readyState >= 3);

  useEffect(() => {
    const onCanPlay = () => setIsReady(true);
    const onEmptied = () => setIsReady(false);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("emptied", onEmptied);

    if (video.readyState >= 3) {
      setIsReady(true);
    }

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("emptied", onEmptied);
    };
  }, [video]);

  return (
    <div className={cn(styles.wrapper)}>
      <PlaybackButtons playerRef={playerRef} isReady={isReady} />
      <Seekbar playerRef={playerRef} isReady={isReady} />
      <OptionsButtons
        playerRef={playerRef}
        setVolume={setVolume}
        volume={volume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />
    </div>
  );
};

interface PlaybackButtonsProps {
  playerRef: VideoPlayerRef;
  isReady: boolean;
}
const PlaybackButtons = ({ playerRef, isReady }: PlaybackButtonsProps) => {
  const { player, video } = playerRef;
  const [isPlaying, , setIsPlaying] = useStateWithRef(!video.paused && !video.ended);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnLiveEdge, setIsOnLiveEdge] = useState(player.isLive());

  useEffect(() => {
    setIsPlaying(!video.paused && !video.ended);

    const updatePlaying = () => setIsPlaying(!video.paused && !video.ended);

    video.addEventListener("pause", updatePlaying);
    video.addEventListener("play", updatePlaying);
    video.addEventListener("playing", updatePlaying);
    video.addEventListener("ended", updatePlaying);

    return () => {
      video.removeEventListener("pause", updatePlaying);
      video.removeEventListener("play", updatePlaying);
      video.removeEventListener("playing", updatePlaying);
      video.removeEventListener("ended", updatePlaying);
    };
  }, [video, setIsPlaying]);

  useEffect(() => {
    let overlayTimeout = -1;
    const showOverlay = () => {
      clearTimeout(overlayTimeout);
      overlayTimeout = window.setTimeout(() => {
        setIsLoading(true);
      }, OVERLAY_TIMEOUT_DELAY);
    };
    const hideOverlay = () => {
      clearTimeout(overlayTimeout);
      setIsLoading(false);
    };

    video.addEventListener("waiting", showOverlay);
    video.addEventListener("playing", hideOverlay);
    video.addEventListener("pause", hideOverlay);
    video.addEventListener("seeking", showOverlay);
    video.addEventListener("seeked", hideOverlay);

    const onBuffering = (e: Event) => {
      const buffering = (e as Event & { buffering: boolean }).buffering;
      if (buffering) {
        showOverlay();
      } else {
        hideOverlay();
      }
    };
    player.addEventListener("buffering", onBuffering);

    return () => {
      clearTimeout(overlayTimeout);
      video.removeEventListener("waiting", showOverlay);
      video.removeEventListener("playing", hideOverlay);
      video.removeEventListener("pause", hideOverlay);
      video.removeEventListener("seeking", showOverlay);
      video.removeEventListener("seeked", hideOverlay);
      player.removeEventListener("buffering", onBuffering);
    };
  }, [player, video]);

  useEffect(() => {
    if (!player.isLive()) return;

    const updateLiveTimeshiftState = () => {
      const seekRange = player.seekRange();
      const distanceFromLiveEdge = seekRange.end - video.currentTime;
      const isTimeshifted = distanceFromLiveEdge > 5;
      const seekRangeSize = seekRange.end - seekRange.start;
      const isTimeshiftAvailable = seekRangeSize > 0;
      setIsOnLiveEdge(!isTimeshifted && (!video.paused || !isTimeshiftAvailable));
    };

    updateLiveTimeshiftState();

    video.addEventListener("timeupdate", updateLiveTimeshiftState);
    video.addEventListener("pause", updateLiveTimeshiftState);
    video.addEventListener("playing", updateLiveTimeshiftState);

    return () => {
      video.removeEventListener("timeupdate", updateLiveTimeshiftState);
      video.removeEventListener("pause", updateLiveTimeshiftState);
      video.removeEventListener("playing", updateLiveTimeshiftState);
    };
  }, [player, video]);

  const onPlayClick = useCallback(() => {
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [video]);

  const onSkipAhead = useCallback(() => {
    if (player.isLive()) {
      const seekRange = player.seekRange();
      video.currentTime = Math.min(video.currentTime + 30, seekRange.end);
    } else {
      video.currentTime = Math.min(video.currentTime + 30, video.duration);
    }
  }, [player, video]);

  const onSkipBackwards = useCallback(() => {
    if (player.isLive()) {
      const seekRange = player.seekRange();
      video.currentTime = Math.max(video.currentTime - 30, seekRange.start);
    } else {
      video.currentTime = Math.max(video.currentTime - 30, 0);
    }
  }, [player, video]);

  const playPauseState = useMemo(() => {
    if (isLoading || !isReady) {
      return "buffering";
    }

    return isPlaying ? "pause" : "play";
  }, [isLoading, isPlaying, isReady]);

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
