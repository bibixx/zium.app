import { MutableRefObject, useEffect, useRef, useState } from "react";
import type shaka from "shaka-player";
import classNames from "classnames";
import Lottie from "lottie-react";
import loaderAnimation from "../../assets/loader.json";
import styles from "./BufferingOverlay.module.scss";

const SHOW_DELAY_MS = 10;
const ANIMATION_HIDE_DELAY_MS = 400;

interface BufferingOverlayProps {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  playerRef: MutableRefObject<shaka.Player | null>;
}

export const BufferingOverlay = ({ videoRef, playerRef }: BufferingOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const showTimeoutRef = useRef(-1);
  const hideAnimationTimeoutRef = useRef(-1);

  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (video == null) return;

    const show = () => {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
        clearTimeout(hideAnimationTimeoutRef.current);
      }, SHOW_DELAY_MS);
    };

    const hide = () => {
      clearTimeout(showTimeoutRef.current);
      setIsVisible(false);
      hideAnimationTimeoutRef.current = window.setTimeout(() => {
        setIsAnimating(false);
      }, ANIMATION_HIDE_DELAY_MS);
    };

    video.addEventListener("waiting", show);
    video.addEventListener("playing", hide);
    video.addEventListener("pause", hide);
    video.addEventListener("seeking", show);
    video.addEventListener("seeked", hide);

    const onBuffering = (e: Event) => {
      const buffering = (e as Event & { buffering: boolean }).buffering;
      if (buffering) {
        show();
      } else {
        hide();
      }
    };

    player?.addEventListener("buffering", onBuffering);

    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideAnimationTimeoutRef.current);
      video.removeEventListener("waiting", show);
      video.removeEventListener("playing", hide);
      video.removeEventListener("pause", hide);
      video.removeEventListener("seeking", show);
      video.removeEventListener("seeked", hide);
      player?.removeEventListener("buffering", onBuffering);
    };
  }, [videoRef, playerRef]);

  return (
    <div className={classNames(styles.overlay, { [styles.hidden]: !isVisible })}>
      <div className={styles.animation}>{isAnimating && <Lottie animationData={loaderAnimation} loop />}</div>
    </div>
  );
};
