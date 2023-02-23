import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { GridWindow } from "../../types/GridWindow";
import { getInitialState, windowGridReducer } from "../../utils/windowGridStore";
import { MainVideoWindow } from "../../components/VideoWindow/MainVideoWindow";
import { VideoJsPlayer } from "video.js";
import { DriverVideoWindow } from "../../components/VideoWindow/DriverVideoWindow";
import { assertNever } from "../../utils/assertNever";
import { DataChannelVideoWindow } from "../../components/VideoWindow/DataChannelVideoWindow";
import { StreamsStateData } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { combineWindowsWithStreams, getAvailableDrivers } from "./Viewer.utils";
import { useGrid } from "./hooks/useGrid";
import { DriverTrackerVideoWindow } from "../../components/VideoWindow/DriverTrackerVideoWindow";
import { useVideoRaceDetails } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails";
import { useParams } from "react-router-dom";
import styles from "./Viewer.module.css";
import { RnDWindow } from "../../components/RnDWindow/RnDWindow";
import { WithVariables } from "../../components/WithVariables/WithVariables";
import { Dimensions } from "../../types/Dimensions";
import { useVideoAudio } from "./hooks/useVideoAudio";
import { useSyncVideos } from "./hooks/useSyncVideos";

interface ViewerProps {
  streams: StreamsStateData;
}

export const Viewer = ({ streams }: ViewerProps) => {
  const { baseGrid, grid } = useGrid();
  const [{ layout, windows }, dispatch] = useReducer(windowGridReducer, getInitialState());

  const [areVideosPaused, setAreVideosPaused] = useState(true);
  const { audioFocusedWindow, onWindowAudioFocus, setVolume, volume } = useVideoAudio({
    windows,
  });

  const windowsWithUrls = useMemo(() => combineWindowsWithStreams(windows, streams), [windows, streams]);
  const windowVideojsRefMapRef = useRef<Record<string, VideoJsPlayer | null>>({});

  const windowsMap = useMemo((): Record<string, GridWindow> => {
    const entries = windowsWithUrls.map((w) => [w.id, w]);
    return Object.fromEntries(entries);
  }, [windowsWithUrls]);

  const onLayoutChange = (dimensions: Dimensions, i: string) => {
    dispatch({
      type: "updateDimension",
      dimensions,
      id: i,
    });
  };

  const executeOnAll = useCallback(
    (cb: (player: VideoJsPlayer) => void, callerId: string) => {
      windowsWithUrls.forEach((w) => {
        const player = windowVideojsRefMapRef.current[w.id];

        if (w.id === callerId || player == null) {
          return;
        }

        cb(player);
      });
    },
    [windowsWithUrls],
  );

  const availableDrivers = useMemo(() => getAvailableDrivers(streams), [streams]);

  const getLayoutChild = useCallback(
    (gridWindow: GridWindow) => {
      const setRef = (video: VideoJsPlayer | null) => {
        windowVideojsRefMapRef.current[gridWindow.id] = video;
      };

      if (gridWindow.type === "main") {
        return (
          <MainVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            executeOnAll={executeOnAll}
            onPlayingChange={(isPaused: boolean) => setAreVideosPaused(isPaused)}
            isPaused={areVideosPaused}
            isAudioFocused={audioFocusedWindow === gridWindow.id}
            onWindowAudioFocus={() => onWindowAudioFocus(gridWindow.id)}
            volume={volume}
            setVolume={setVolume}
          />
        );
      }

      if (gridWindow.type === "driver") {
        const onDriverChange = (streamIdentifier: string) => {
          dispatch({
            type: "updateWindow",
            window: {
              type: "driver",
              id: gridWindow.id,
              firstName: "",
              lastName: "",
              url: "",
              team: "",
              color: "",
              streamIdentifier,
            },
          });
        };

        return (
          <DriverVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            availableDrivers={availableDrivers}
            onDriverChange={onDriverChange}
            isPaused={areVideosPaused}
            isAudioFocused={audioFocusedWindow === gridWindow.id}
            onWindowAudioFocus={() => onWindowAudioFocus(gridWindow.id)}
            volume={volume}
          />
        );
      }

      if (gridWindow.type === "driver-tracker") {
        return <DriverTrackerVideoWindow gridWindow={gridWindow} ref={setRef} isPaused={areVideosPaused} />;
      }

      if (gridWindow.type === "data-channel") {
        return <DataChannelVideoWindow gridWindow={gridWindow} ref={setRef} isPaused={areVideosPaused} />;
      }

      return assertNever(gridWindow);
    },
    [executeOnAll, areVideosPaused, audioFocusedWindow, volume, setVolume, onWindowAudioFocus, availableDrivers],
  );

  useSyncVideos({ windows, windowVideojsRefMapRef });

  return (
    <WithVariables
      className={styles.backgroundWrapper}
      variables={{
        gridWidth: `${baseGrid[0]}px`,
        gridHeight: `${baseGrid[1]}px`,
      }}
    >
      {layout.map((l) => {
        const gridWindow = windowsMap[l.id];
        const dimension: Dimensions = {
          width: l.width,
          height: l.height,
          x: l.x,
          y: l.y,
        };

        return (
          <RnDWindow
            key={gridWindow.id}
            baseGrid={baseGrid}
            grid={grid}
            dimensions={dimension}
            onChange={(dimensions: Dimensions) => {
              onLayoutChange(dimensions, l.id);
            }}
            zIndex={l.zIndex}
            bringToFront={() => dispatch({ type: "bringToFront", id: l.id })}
          >
            {getLayoutChild(gridWindow)}
          </RnDWindow>
        );
      })}
    </WithVariables>
  );
};

export const ViewerWithState = () => {
  const { raceId } = useParams();
  const state = useVideoRaceDetails(raceId as string);

  if (state.state === "error") {
    return <div>Error occurred</div>;
  }

  if (state.state === "loading") {
    return <div>Loading...</div>;
  }

  return <Viewer streams={state.data} />;
};
