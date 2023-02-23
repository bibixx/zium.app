import { forwardRef, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import styles from "./DriverVideoWindow.module.css";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow } from "../../../types/GridWindow";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../../utils/onVideoWindowReady";
import { setRef } from "../../../utils/setRef";
import { VideoJS } from "../../VideoJS/VideoJS";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";

interface AllDriversInfo {
  color: string;
  firstName: string;
  lastName: string;
  team: string;
  id: string;
}

interface DriverVideoWindowProps extends VideoWindowProps {
  gridWindow: DriverGridWindow;
  availableDrivers: AllDriversInfo[];
  onDriverChange: (streamIdentifier: string) => void;
  isAudioFocused: boolean;
  onWindowAudioFocus: () => void;
  volume: number;
}

export const DriverVideoWindow = forwardRef<VideoJsPlayer | null, DriverVideoWindowProps>(
  (
    { gridWindow, availableDrivers, onDriverChange, isPaused, isAudioFocused, onWindowAudioFocus, volume },
    forwardedRef,
  ) => {
    const playerRef = useRef<VideoJsPlayer | null>(null);
    const streamVideoState = useStreamVideo(gridWindow.url);

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
          url={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          isPaused={isPaused}
          volume={isAudioFocused ? volume : 0}
        />
        <div className={styles.driverName}>
          <div className={styles.driverPhotoWrapper}>
            <img src={`/images/avatars/2022/${gridWindow.streamIdentifier}.png`} alt="" />
          </div>
          <div className={styles.driverNameWrapper}>
            <div>{gridWindow.firstName}</div>
            <div className={styles.driverNameBold}>{gridWindow.lastName}</div>
          </div>
        </div>
        <div className={styles.availableDriversContainer} onMouseDown={(e) => e.stopPropagation()}>
          <select value={gridWindow.streamIdentifier} onChange={onChange}>
            {availableDrivers.map((driver) => (
              <option value={driver.id} key={driver.id}>
                {driver.lastName} {driver.firstName}
              </option>
            ))}
          </select>
          <button onClick={onWindowAudioFocus}>Focus audio</button>
        </div>
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: VideoJsPlayerOptions = {
  controls: false,
};
