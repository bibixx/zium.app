import objectMerge from "object-merge";
import { forwardRef, useEffect, useRef } from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "videojs-contrib-quality-levels";
import { setRef } from "../utils/setRef";

interface VideoJSProps {
  url: string;
  options: VideoJsPlayerOptions;
  onReady: (player: VideoJsPlayer) => void;
  isPaused: boolean;
  volume?: number;
}

export const VideoJS = forwardRef<VideoJsPlayer | null, VideoJSProps>(
  (
    { url, options: overwrittenOptions, onReady, isPaused, volume = 0 },
    ref,
  ) => {
    const placeholderRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<VideoJsPlayer | null>(null);

    useEffect(() => {
      const placeholderEl = placeholderRef.current;
      if (placeholderEl == null) {
        return;
      }

      const $videoElement = document.createElement("video-js");
      placeholderEl.appendChild($videoElement);

      const baseOptions: VideoJsPlayerOptions = {
        sources: [
          {
            src: url,
            type: "application/x-mpegURL",
          },
        ],
        autoplay: !isPaused,
        controls: true,
        fill: true,
        userActions: {
          click: false,
          doubleClick: false,
        },
        controlBar: {
          fullscreenToggle: false,
          pictureInPictureToggle: false,
          audioTrackButton: false,
          volumePanel: false,
          durationDisplay: false,
          currentTimeDisplay: false,
          playToggle: false,
          remainingTimeDisplay: false,
          progressControl: false,
        },
      };
      const options = objectMerge(baseOptions, overwrittenOptions);
      const player = videojs($videoElement, options, function (this) {
        onReady(this);
      });
      player.volume(volume);

      setRef(ref, player);
      playerRef.current = player;

      return () => {
        if (!player.isDisposed()) {
          player.dispose();
          setRef(ref, null);
        }
      };
    }, [overwrittenOptions, url]);

    useEffect(() => {
      if (isPaused) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play();
      }
    }, [isPaused]);

    useEffect(() => {
      playerRef.current?.volume(volume);
    }, [volume]);

    return <div ref={placeholderRef} className="video-wrapper" />;
  },
);
