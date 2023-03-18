import { forwardRef, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import styles from "./DriverVideoWindow.module.scss";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../../utils/onVideoWindowReady";
import { setRef } from "../../../utils/setRef";
import { VideoJS } from "../../VideoJS/VideoJS";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { DriverData } from "../../../views/Viewer/Viewer.utils";

interface DriverVideoWindowProps extends VideoWindowProps {
  gridWindow: DriverGridWindow;
  availableDrivers: DriverData[];
  onDriverChange: (streamIdentifier: string) => void;
  isAudioFocused: boolean;
  onWindowAudioFocus: () => void;
  volume: number;
  onDelete: () => void;
}

export const DriverVideoWindow = forwardRef<VideoJsPlayer | null, DriverVideoWindowProps>(
  (
    {
      gridWindow,
      streamUrl,
      availableDrivers,
      onDriverChange,
      isPaused,
      isAudioFocused,
      onWindowAudioFocus,
      volume,
      onDelete,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<VideoJsPlayer | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const currentDriver = availableDrivers.find((driver) => driver.id === gridWindow.driverId);

    const ref = (r: VideoJsPlayer | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: VideoJsPlayer) => {
      onVideoWindowReadyBase(player);
    };

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onDriverChange(e.target.value);
    };

    if (streamVideoState.state === "loading") {
      return null;
    }

    if (streamVideoState.state === "error") {
      return <div style={{ color: "white" }}>{streamVideoState.error}</div>;
    }

    return (
      <VideoWindowWrapper>
        <VideoJS
          url={streamVideoState.data.videoUrl}
          laURL={streamVideoState.data.laURL}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
          volume={isAudioFocused ? volume : 0}
        />
        <div className={styles.driverName}>
          <div className={styles.driverPhotoWrapper}>
            <img src={currentDriver?.imageUrl} alt="" />
          </div>
          <div className={styles.driverNameWrapper}>
            <div>{currentDriver?.firstName}</div>
            <div className={styles.driverNameBold}>{currentDriver?.lastName}</div>
          </div>
        </div>
        <div className={styles.availableDriversContainer} onMouseDown={(e) => e.stopPropagation()}>
          <select value={currentDriver?.id} onChange={onChange}>
            {availableDrivers.map((driver) => (
              <option value={driver.id} key={driver.id}>
                {driver.lastName} {driver.firstName}
              </option>
            ))}
          </select>
          <button onClick={onWindowAudioFocus}>Focus audio</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: VideoJsPlayerOptions = {
  controls: false,
};
