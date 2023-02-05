import { forwardRef, useMemo, useRef } from "react";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { useStreamVideo } from "../../hooks/useStreamVideo/useStreamVideo";
import { DriverGridWindow, GridWindow } from "../../types/GridWindow";
import { VideoWindowProps } from "../../types/VideoWindowBaseProps";
import { onVideoWindowReadyBase } from "../../utils/onVideoWindowReady";
import { setRef } from "../../utils/setRef";
import { VideoJS } from "../VideoJS";
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
}

export const DriverVideoWindow = forwardRef<
  VideoJsPlayer | null,
  DriverVideoWindowProps
>(
  (
    { gridWindow, executeOnAll, availableDrivers, onDriverChange },
    forwardedRef
  ) => {
    const playerRef = useRef<VideoJsPlayer | null>(null);
    const streamVideoState = useStreamVideo(gridWindow.url);

    const ref = (r: VideoJsPlayer | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: VideoJsPlayer) => {
      onVideoWindowReadyBase(player, executeOnAll, gridWindow.id);
    };

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onDriverChange(e.target.value);
    };

    const onFocusAudio = () => {
      playerRef.current?.muted(false);

      executeOnAll((player) => {
        player.muted(true);
      }, gridWindow.id);
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
                {driver.firstName} {driver.lastName}
              </option>
            ))}
          </select>
          <button onClick={onFocusAudio}>Focus audio</button>
        </div>
      </VideoWindowWrapper>
    );
  }
);

const ADDITIONAL_OPTIONS: VideoJsPlayerOptions = {
  controls: false,
  muted: true,
};
