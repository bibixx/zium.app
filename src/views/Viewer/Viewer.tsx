import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PlayerAPI } from "bitmovin-player";
import { GridWindow } from "../../types/GridWindow";
import { MainVideoWindow } from "../../components/VideoWindow/MainVideoWindow/MainVideoWindow";
import { DriverVideoWindow } from "../../components/VideoWindow/DriverVideoWindow/DriverVideoWindow";
import { assertNever } from "../../utils/assertNever";
import { DataChannelVideoWindow } from "../../components/VideoWindow/DataChannelVideoWindow";
import { StreamsStateData } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { DriverTrackerVideoWindow } from "../../components/VideoWindow/DriverTrackerVideoWindow";
import { useVideoRaceDetails } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails";
import { RnDWindow } from "../../components/RnDWindow/RnDWindow";
import { Dimensions } from "../../types/Dimensions";
import { StreamPickerProvider } from "../../hooks/useStreamPicker/useStreamPicker";
import { StreamPicker } from "../../components/StreamPicker/StreamPicker";
import { Player } from "../../components/Player/Player";
import { getWindowStreamMap, getAvailableDrivers } from "./Viewer.utils";
import { useGrid } from "./hooks/useGrid";
import styles from "./Viewer.module.scss";
import { useVideoAudio } from "./hooks/useVideoAudio";
import { useSyncVideos } from "./hooks/useSyncVideos";
import { BackgroundDots } from "./BackgroundDots/BackgroundDots";
import { useViewerState } from "./hooks/useViewerState/useViewerState";

interface ViewerProps {
  streams: StreamsStateData;
  season: number;
  isLive: boolean;
}

export const Viewer = ({ streams, season, isLive }: ViewerProps) => {
  const { baseGrid, grid } = useGrid();
  const [{ layout, windows }, dispatch] = useViewerState();

  const [areVideosPaused, setAreVideosPaused] = useState(true);
  const { audioFocusedWindow, onWindowAudioFocus, setVolume, volume } = useVideoAudio({
    windows,
  });

  const windowStreamMap = useMemo(() => getWindowStreamMap(windows, streams), [windows, streams]);
  const windowVideojsRefMapRef = useRef<Record<string, PlayerAPI | null>>({});
  const [mainVideoPlayer, setMainVideoPlayer] = useState<PlayerAPI | null>(null);

  const windowsMap = useMemo((): Record<string, GridWindow> => {
    const entries = windows.map((w) => [w.id, w]);
    return Object.fromEntries(entries);
  }, [windows]);

  const onLayoutChange = (dimensions: Dimensions, i: string) => {
    dispatch({
      type: "updateDimension",
      dimensions,
      id: i,
    });
  };

  const executeOnAll = useCallback(
    (cb: (player: PlayerAPI) => void, callerId: string) => {
      windows.forEach((w) => {
        const player = windowVideojsRefMapRef.current[w.id];

        if (w.id === callerId || player == null) {
          return;
        }

        cb(player);
      });
    },
    [windows],
  );

  const availableDrivers = useMemo(() => getAvailableDrivers(streams, season), [season, streams]);

  const getLayoutChild = useCallback(
    (gridWindow: GridWindow) => {
      const setRef = (video: PlayerAPI | null) => {
        windowVideojsRefMapRef.current[gridWindow.id] = video;
      };

      const onDelete = () => {
        dispatch({
          type: "deleteWindow",
          windowId: gridWindow.id,
        });
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
            streamUrl={windowStreamMap[gridWindow.id]}
            onLoaded={setMainVideoPlayer}
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
              driverId: streamIdentifier,
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
            focusMainWindow={() => {
              const mainWindow = windows.find((w) => w.type === "main");

              if (mainWindow) {
                onWindowAudioFocus(mainWindow.id);
              }
            }}
            volume={volume}
            streamUrl={windowStreamMap[gridWindow.id]}
            onDelete={onDelete}
          />
        );
      }

      if (gridWindow.type === "driver-tracker") {
        return (
          <DriverTrackerVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            isPaused={areVideosPaused}
            streamUrl={windowStreamMap[gridWindow.id]}
            onDelete={onDelete}
          />
        );
      }

      if (gridWindow.type === "data-channel") {
        return (
          <DataChannelVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            isPaused={areVideosPaused}
            streamUrl={windowStreamMap[gridWindow.id]}
            onDelete={onDelete}
          />
        );
      }

      return assertNever(gridWindow);
    },
    [
      dispatch,
      executeOnAll,
      areVideosPaused,
      audioFocusedWindow,
      volume,
      setVolume,
      windowStreamMap,
      onWindowAudioFocus,
      availableDrivers,
      windows,
    ],
  );

  useSyncVideos({ windows, windowVideojsRefMapRef, isDisabled: isLive });

  return (
    <StreamPickerProvider>
      <div className={styles.backgroundWrapper}>
        <BackgroundDots baseGrid={baseGrid} />
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
        <StreamPicker availableDrivers={availableDrivers} />
        <Player player={mainVideoPlayer} />
      </div>
    </StreamPickerProvider>
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

  return <Viewer streams={state.streams} season={state.season} isLive={state.isLive} />;
};
