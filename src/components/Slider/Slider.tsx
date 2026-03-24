import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import styles from "./Slider.module.scss";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  onHoveringStart?: () => void;
  onHoveringEnd?: () => void;
  onSeekPositionChange?: (fraction: number) => void;
  bufferLevel?: number;
  disabled?: boolean;
  accentTrack?: boolean;
  renderLabel?: (seekPosition: number) => ReactNode;
  className?: string;
}

export const Slider = ({
  value,
  onValueChange,
  onScrubStart,
  onScrubEnd,
  onHoveringStart,
  onHoveringEnd,
  onSeekPositionChange,
  bufferLevel,
  disabled = false,
  accentTrack = false,
  renderLabel,
  className,
}: SliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [seekPosition, setSeekPosition] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const getFractionFromPosition = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (track == null) return 0;

    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const fraction = getFractionFromPosition(e.clientX);
      setSeekPosition(fraction * 100);
      onSeekPositionChange?.(fraction);

      if (isScrubbing) {
        onValueChange(fraction * 100);
      }
    },
    [getFractionFromPosition, isScrubbing, onValueChange, onSeekPositionChange],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsScrubbing(true);
      onScrubStart?.();

      const fraction = getFractionFromPosition(e.clientX);
      setSeekPosition(fraction * 100);
      onSeekPositionChange?.(fraction);
      onValueChange(fraction * 100);
    },
    [getFractionFromPosition, onValueChange, onScrubStart, onSeekPositionChange],
  );

  useEffect(() => {
    if (!isScrubbing) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      const fraction = getFractionFromPosition(e.clientX);
      setSeekPosition(fraction * 100);
      onSeekPositionChange?.(fraction);
      onValueChange(fraction * 100);
    };

    const onGlobalMouseUp = (e: MouseEvent) => {
      setIsScrubbing(false);
      onScrubEnd?.();

      const track = trackRef.current;
      if (track != null && !track.contains(e.target as Node)) {
        setIsHovering(false);
        onHoveringEnd?.();
      }
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [isScrubbing, getFractionFromPosition, onValueChange, onScrubEnd, onHoveringEnd, onSeekPositionChange]);

  const showHoverEffects = isHovering || accentTrack;

  return (
    <div
      className={cn(styles.sliderTrack, { [styles.disabled]: disabled }, className)}
      ref={trackRef}
      onMouseEnter={() => {
        setIsHovering(true);
        onHoveringStart?.();
      }}
      onMouseLeave={() => {
        if (!isScrubbing) {
          setIsHovering(false);
          onHoveringEnd?.();
        }
      }}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
    >
      <div className={styles.backdrop} />
      {bufferLevel != null && <div className={styles.bufferLevel} style={{ width: `${bufferLevel}%` }} />}
      {isHovering && <div className={styles.seekPosition} style={{ width: `${seekPosition}%` }} />}
      <div
        className={cn(styles.playbackPosition, { [styles.hovered]: showHoverEffects })}
        style={{ width: `${value}%` }}
      >
        <div className={cn(styles.playbackMarker, { [styles.markerVisible]: showHoverEffects })} />
      </div>

      {(isHovering || isScrubbing) && renderLabel != null && (
        <div className={styles.label} style={{ left: `${seekPosition}%` }}>
          <div className={styles.labelInner}>{renderLabel(seekPosition)}</div>
        </div>
      )}
    </div>
  );
};
