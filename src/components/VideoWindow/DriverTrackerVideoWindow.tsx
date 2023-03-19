import { PlayerAPI } from "bitmovin-player";
import { forwardRef, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { BaseGridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../VideoJS/VideoJS";
import { VideoWindowWrapper } from "./VideoWindowWrapper/VideoWindowWrapper";
import styles from "./VideoWindow.module.scss";

interface DriverTrackerVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: () => void;
}

export const DriverTrackerVideoWindow = forwardRef<PlayerAPI | null, DriverTrackerVideoWindowProps>(
  ({ isPaused, streamUrl, onDelete }, forwardedRef) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: PlayerAPI) => {
      onVideoWindowReadyBase(player);
    };

    if (streamVideoState.state !== "done") {
      return null;
    }

    return (
      <VideoWindowWrapper>
        <VideoJS
          videoStreamInfo={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
        />
        <button className={styles.closeButton} onClick={onDelete}>
          <XMarkIcon width={20} height={20} fill="currentColor" />
        </button>
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: AdditionalVideoJSOptions = {
  ui: false,
  playback: {
    muted: true,
  },
};
