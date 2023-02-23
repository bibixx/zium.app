import { forwardRef, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
import { VideoJS } from "../VideoJS/VideoJS";
import { VideoWindowWrapper } from "./VideoWindowWrapper";

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

export const DriverVideoWindow = forwardRef<
  VideoJsPlayer | null,
  DriverVideoWindowProps
>(
  (
    {
      gridWindow,
      availableDrivers,
      onDriverChange,
      isPaused,
      isAudioFocused,
      onWindowAudioFocus,
      volume,
    },
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
        <div
          className="video-window__driver-name"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div>{gridWindow.firstName}</div>
          <div
            className="video-window__driver-name--bold"
            style={{ color: gridWindow.color }}
          >
            {gridWindow.lastName}
          </div>
        </div>
        <div
          className="video-window__available-drivers-container"
          onMouseDown={(e) => e.stopPropagation()}
        >
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
