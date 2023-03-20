import { forwardRef, useRef } from "react";
import { PlayerAPI } from "bitmovin-player";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { BaseGridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
// import { attachUseBestQuality } from "../../utils/attachUseBestQuality";
import { AdditionalVideoJSOptions, VideoJS } from "../VideoJS/VideoJS";
import { Button } from "../Button/Button";
import { VideoWindowWrapper } from "./VideoWindowWrapper/VideoWindowWrapper";
import styles from "./VideoWindow.module.scss";

interface DataChannelVideoWindowProps extends VideoWindowProps {
  gridWindow: BaseGridWindow;
  onDelete: () => void;
}

export const DataChannelVideoWindow = forwardRef<PlayerAPI | null, DataChannelVideoWindowProps>(
  ({ isPaused, streamUrl, onDelete }, forwardedRef) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: PlayerAPI) => {
      onVideoWindowReadyBase(player);

      // attachUseBestQuality(player);
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
        <div className={styles.closeButtonWrapper}>
          <Button variant="SecondaryInverted" onClick={onDelete} iconLeft={XMarkIcon} />
        </div>
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
