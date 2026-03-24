import { useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { VideoPlayerRef } from "../../../VideoPlayer/VideoPlayer.types";
import { Slider } from "../../../Slider/Slider";
import styles from "./Seekbar.module.scss";

interface SeekbarProps {
  playerRef: VideoPlayerRef;
  isReady: boolean;
}

export const Seekbar = ({ playerRef, isReady }: SeekbarProps) => {
  const { player, video } = playerRef;
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [bufferLevel, setBufferLevel] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [labelTime, setLabelTime] = useState("");
  const [currentTimeText, setCurrentTimeText] = useState("--:--");
  const [totalTimeText, setTotalTimeText] = useState("--:--");
  const [isLive, setIsLive] = useState(false);
  const [isOnLiveEdge, setIsOnLiveEdge] = useState(false);
  const wasPlayingRef = useRef(false);

  const getDuration = useCallback(() => {
    if (player.isLive()) {
      const range = player.seekRange();
      return range.end - range.start;
    }
    return video.duration || 0;
  }, [player, video]);

  const getPosition = useCallback(() => {
    if (player.isLive()) {
      const range = player.seekRange();
      return video.currentTime - range.start;
    }
    return video.currentTime;
  }, [player, video]);

  // Update time displays and positions
  useEffect(() => {
    let rafId: number;

    if (!isReady) {
      setCurrentTimeText("--:--");
      setTotalTimeText("--:--");
      setPlaybackPosition(0);
      setBufferLevel(0);
    }

    const update = () => {
      if (!isScrubbing && isReady) {
        const duration = getDuration();
        const position = getPosition();
        const fraction = duration > 0 ? (position / duration) * 100 : 0;
        setPlaybackPosition(fraction);

        // Buffer level
        if (video.buffered.length > 0) {
          const currentTime = video.currentTime;
          for (let i = 0; i < video.buffered.length; i++) {
            if (currentTime >= video.buffered.start(i) && currentTime <= video.buffered.end(i)) {
              const bufferEnd = player.isLive()
                ? video.buffered.end(i) - player.seekRange().start
                : video.buffered.end(i);
              setBufferLevel(duration > 0 ? (bufferEnd / duration) * 100 : 0);
              break;
            }
          }
        }

        // Time labels
        const live = player.isLive();
        setIsLive(live);

        if (live) {
          const seekRange = player.seekRange();
          const distanceFromEdge = seekRange.end - video.currentTime;
          setIsOnLiveEdge(distanceFromEdge < 5 && !video.paused);
          setCurrentTimeText(formatTime(distanceFromEdge > 1 ? -distanceFromEdge : 0));
          setTotalTimeText("");
        } else {
          setCurrentTimeText(formatTime(video.currentTime));
          setTotalTimeText(formatTime(video.duration || 0));
        }
      }

      rafId = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(rafId);
  }, [video, player, isScrubbing, isReady, getDuration, getPosition]);

  const fractionToTime = useCallback(
    (fraction: number) => {
      const duration = getDuration();

      if (player.isLive()) {
        return player.seekRange().start + fraction * duration;
      }

      return fraction * duration;
    },
    [getDuration, player],
  );

  const onSeekPositionChange = useCallback(
    (fraction: number) => {
      const time = fractionToTime(fraction);
      setLabelTime(formatTime(player.isLive() ? time - player.seekRange().end : time));
    },
    [fractionToTime, player],
  );

  const onValueChange = useCallback(
    (value: number) => {
      const fraction = value / 100;
      setPlaybackPosition(value);
      video.currentTime = fractionToTime(fraction);
    },
    [video, fractionToTime],
  );

  const onScrubStart = useCallback(() => {
    wasPlayingRef.current = !video.paused;
    setIsScrubbing(true);
  }, [video]);

  const onScrubEnd = useCallback(() => {
    setIsScrubbing(false);
    if (wasPlayingRef.current) {
      video.play().catch(() => {});
    }
  }, [video]);

  const onGoToLive = useCallback(() => {
    if (player.isLive()) {
      player.goToLive();
    }
  }, [player]);

  const renderLabel = useCallback(() => labelTime, [labelTime]);

  return (
    <div
      className={cn(styles.seekbarWrapper, {
        [styles.isReady]: isReady,
      })}
    >
      <div className={styles.timeLabels}>
        <div className={styles.currentTime}>
          {isLive ? (
            <button
              className={cn(styles.liveIndicator, { [styles.liveEdge]: isOnLiveEdge })}
              onClick={isOnLiveEdge ? undefined : onGoToLive}
              type="button"
            >
              <span className={styles.signalIcon} />
              <span>{isOnLiveEdge ? "LIVE" : currentTimeText}</span>
            </button>
          ) : (
            <>
              <span className={styles.timePlaceholder}>--:--</span>
              <span className={styles.timeLabel}>{currentTimeText}</span>
            </>
          )}
        </div>
        {!isLive && (
          <div className={styles.totalTime}>
            <span className={styles.timePlaceholder}>--:--</span>
            <span className={styles.timeLabel}>{totalTimeText}</span>
          </div>
        )}
      </div>
      <Slider
        value={playbackPosition}
        onValueChange={onValueChange}
        onScrubStart={onScrubStart}
        onScrubEnd={onScrubEnd}
        onSeekPositionChange={onSeekPositionChange}
        bufferLevel={bufferLevel}
        disabled={!isReady}
        renderLabel={renderLabel}
        className={styles.seekbar}
      />
    </div>
  );
};

function formatTime(seconds: number): string {
  const negative = seconds < 0;
  const abs = Math.abs(seconds);

  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);

  const pad = (n: number) => String(n).padStart(2, "0");

  const time = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  return negative ? `-${time}` : time;
}
