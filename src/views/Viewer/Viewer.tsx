import { memo, useCallback, useMemo, useRef, useState } from "react";
import { PlayerAPI } from "bitmovin-player";
import deepEqual from "fast-deep-equal/es6";
import { Transition, TransitionGroup } from "react-transition-group";
import { GridWindow } from "../../types/GridWindow";
import { MainVideoWindow } from "../../components/VideoWindow/MainVideoWindow/MainVideoWindow";
import { DriverVideoWindow } from "../../components/VideoWindow/DriverVideoWindow/DriverVideoWindow";
import { assertNever } from "../../utils/assertNever";
import { DataChannelVideoWindow } from "../../components/VideoWindow/DataChannelVideoWindow/DataChannelVideoWindow";
import { PlaybackOffsets, RaceInfo, StreamsStateData } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { DriverTrackerVideoWindow } from "../../components/VideoWindow/DriverTrackerVideoWindow/DriverTrackerVideoWindow";
import { RnDWindow } from "../../components/RnDWindow/RnDWindow";
import { Dimensions } from "../../types/Dimensions";
import { StreamPickerProvider } from "../../hooks/useStreamPicker/useStreamPicker";
import { StreamPicker } from "../../components/StreamPicker/StreamPicker";
import { Player } from "../../components/Player/Player";
import { isNotNullable } from "../../utils/isNotNullable";
import { CookieBanner } from "../../components/CookieBanner/CookieBanner";
import { isValidGridWindowType } from "../../utils/isValidGridWindowType";
import { ZiumOffsetsOverwriteOnStartDialog } from "../../components/ZiumOffsetsDialogs/ZiumOffsetsOverwriteOnStartDialog";
import { GlobalShortcutsSnackbar } from "../../components/ShortcutsSnackbar/ShortcutsSnackbar";
import { getWindowStreamMap, getAvailableDrivers } from "./Viewer.utils";
import { useGrid } from "./hooks/useGrid";
import styles from "./Viewer.module.scss";
import { useVideoAudio } from "./hooks/useVideoAudio";
import { useSyncVideos } from "./hooks/useSyncVideos";
import { BackgroundDots } from "./BackgroundDots/BackgroundDots";
import { useViewerState } from "./hooks/useViewerState/useViewerState";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useCmdTutorial } from "./hooks/useCmdTutorial";
import { GridLayoutFillMode } from "./hooks/useViewerState/useViewerState.utils";
import { useZiumOffsets } from "./hooks/useZiumOffsets/useZiumOffsets";
import { useNotifyAboutNewEvent } from "./hooks/useNotifyAboutNewEvent/useNotifyAboutNewEvent";

interface ViewerProps {
  streams: StreamsStateData;
  season: number;
  isLive: boolean;
  raceInfo: RaceInfo;
  playbackOffsets: PlaybackOffsets;
  raceId: string;
}

export const Viewer = memo(({ streams, season, isLive, raceInfo, playbackOffsets, raceId }: ViewerProps) => {
  const { baseGrid, grid } = useGrid();
  const [viewerState, dispatch] = useViewerState();
  const { layout, windows } = useMemo(
    () => viewerState.savedLayouts[viewerState.currentLayoutIndex],
    [viewerState.currentLayoutIndex, viewerState.savedLayouts],
  );

  const [areVideosPaused, setAreVideosPaused] = useState(true);
  const [areClosedCaptionsOn, setAreClosedCaptionsOn] = useState(false);
  const { audioFocusedWindow, onWindowAudioFocus, setVolume, volume, internalVolume, setIsMuted, isMuted } =
    useVideoAudio({
      windows,
    });

  const windowStreamMap = useMemo(() => getWindowStreamMap(windows, streams), [windows, streams]);
  const windowVideojsRefMapRef = useRef<Record<string, PlayerAPI | null>>({});
  const [mainVideoPlayer, setMainVideoPlayer] = useState<PlayerAPI | null>(null);
  const { onResize } = useCmdTutorial();

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

  const createWindow = useCallback(
    (newWindow: GridWindow, dimensions: Dimensions) => {
      dispatch({
        type: "createWindow",
        window: newWindow,
        dimensions,
      });
    },
    [dispatch],
  );

  const loadLayout = useCallback(
    (selectedLayoutIndex: number) => {
      dispatch({
        type: "loadLayout",
        layoutIndex: selectedLayoutIndex,
      });
    },
    [dispatch],
  );
  const duplicateLayout = useCallback(
    (sourceLayoutIndex: number, name: string) => {
      dispatch({
        type: "duplicateLayout",
        sourceLayoutIndex,
        name,
      });
    },
    [dispatch],
  );
  const renameLayout = useCallback(
    (layoutIndex: number, name: string) => {
      dispatch({
        type: "renameLayout",
        layoutIndex,
        name,
      });
    },
    [dispatch],
  );
  const deleteLayout = useCallback(
    (layoutIndex: number) => {
      dispatch({
        type: "deleteLayout",
        layoutIndex: layoutIndex,
      });
    },
    [dispatch],
  );

  const availableDrivers = useMemo(() => getAvailableDrivers(streams, season), [season, streams]);
  const usedWindows = useMemo(
    () =>
      windows.map((w) => {
        if (w.type === "driver") {
          return w.driverId;
        }

        return w.type;
      }),
    [windows],
  );

  const hasOnlyOneStream = useMemo(() => {
    const allStreams = [
      streams.defaultStream,
      streams.driverTrackerStream,
      streams.dataChannelStream,
      ...streams.driverStreams,
      ...streams.otherStreams,
    ].filter(isNotNullable);

    return allStreams.length === 1;
  }, [streams]);

  const { dialogState: ziumOffsetsDialogState } = useZiumOffsets(raceId, hasOnlyOneStream, setAreVideosPaused);

  const getLayoutChild = useCallback(
    (gridWindow: GridWindow, fillMode: GridLayoutFillMode) => {
      const setRef = (video: PlayerAPI | null) => {
        windowVideojsRefMapRef.current[gridWindow.id] = video;
      };

      const onDelete = () => {
        dispatch({
          type: "deleteWindow",
          windowId: gridWindow.id,
        });
      };

      const updateFillMode = (fillMode: GridLayoutFillMode) => {
        dispatch({
          type: "updateFillMode",
          id: gridWindow.id,
          fillMode,
        });
      };

      const onSourceChange = (streamIdentifier: string) => {
        if (isValidGridWindowType(streamIdentifier) && streamIdentifier !== "driver") {
          dispatch({
            type: "updateWindow",
            window: {
              type: streamIdentifier,
              id: gridWindow.id,
            },
          });
          return;
        }

        dispatch({
          type: "updateWindow",
          window: {
            type: "driver",
            id: gridWindow.id,
            driverId: streamIdentifier,
          },
        });
      };

      if (gridWindow.type === "main") {
        return (
          <MainVideoWindow
            ref={(ref) => {
              setRef(ref);
              setMainVideoPlayer(ref);
            }}
            onPlayingChange={(isPaused: boolean) => setAreVideosPaused(isPaused)}
            isPaused={areVideosPaused}
            isAudioFocused={audioFocusedWindow === gridWindow.id}
            onWindowAudioFocus={() => onWindowAudioFocus(gridWindow.id)}
            volume={volume}
            setVolume={setVolume}
            streamUrl={windowStreamMap[gridWindow.id]}
            fillMode={fillMode}
            updateFillMode={updateFillMode}
            areClosedCaptionsOn={areClosedCaptionsOn}
            setAreClosedCaptionsOn={setAreClosedCaptionsOn}
            hasOnlyOneStream={hasOnlyOneStream}
          />
        );
      }

      if (gridWindow.type === "driver") {
        return (
          <DriverVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            availableDrivers={availableDrivers}
            onDriverChange={onSourceChange}
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
            hasOnlyOneStream={hasOnlyOneStream}
            fillMode={fillMode}
            updateFillMode={updateFillMode}
          />
        );
      }

      if (gridWindow.type === "driver-tracker") {
        return (
          <DriverTrackerVideoWindow
            gridWindow={gridWindow}
            onSourceChange={onSourceChange}
            ref={setRef}
            isPaused={areVideosPaused}
            streamUrl={windowStreamMap[gridWindow.id]}
            onDelete={onDelete}
            fillMode={fillMode}
            updateFillMode={updateFillMode}
          />
        );
      }

      if (gridWindow.type === "data-channel") {
        return (
          <DataChannelVideoWindow
            gridWindow={gridWindow}
            onSourceChange={onSourceChange}
            ref={setRef}
            isPaused={areVideosPaused}
            streamUrl={windowStreamMap[gridWindow.id]}
            onDelete={onDelete}
            fillMode={fillMode}
            updateFillMode={updateFillMode}
          />
        );
      }

      return assertNever(gridWindow);
    },
    [
      dispatch,
      areVideosPaused,
      audioFocusedWindow,
      volume,
      setVolume,
      windowStreamMap,
      areClosedCaptionsOn,
      onWindowAudioFocus,
      availableDrivers,
      hasOnlyOneStream,
      windows,
    ],
  );

  useSyncVideos({ windows, windowVideojsRefMapRef, isLive, playbackOffsets });
  useGlobalShortcuts(mainVideoPlayer, setAreVideosPaused, setAreClosedCaptionsOn);
  useNotifyAboutNewEvent(raceId);

  const globalFeeds = useMemo(
    () => [streams.defaultStream, streams.driverTrackerStream, streams.dataChannelStream],
    [streams.dataChannelStream, streams.defaultStream, streams.driverTrackerStream],
  );

  return (
    <StreamPickerProvider>
      <div className={styles.backgroundWrapper}>
        <CookieBanner position="top" mode="fixed" />
        <BackgroundDots baseGrid={baseGrid} />
        <TransitionGroup component={null}>
          {layout.map((l) => {
            const gridWindow = windowsMap[l.id];
            const dimension: Dimensions = {
              width: l.width,
              height: l.height,
              x: l.x,
              y: l.y,
            };

            return (
              <Transition timeout={300} key={gridWindow.id}>
                {(transitionStatus) => (
                  <RnDWindow
                    grid={grid}
                    dimensions={dimension}
                    onChange={(dimensions: Dimensions) => {
                      onLayoutChange(dimensions, l.id);
                    }}
                    zIndex={l.zIndex}
                    bringToFront={() => dispatch({ type: "bringToFront", id: l.id })}
                    transitionStatus={transitionStatus}
                    onResize={onResize}
                  >
                    {getLayoutChild(gridWindow, l.fillMode)}
                  </RnDWindow>
                )}
              </Transition>
            );
          })}
        </TransitionGroup>
        <StreamPicker availableDrivers={availableDrivers} globalFeeds={globalFeeds} />
        <Player
          player={mainVideoPlayer}
          raceInfo={raceInfo}
          setVolume={setVolume}
          volume={internalVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          usedWindows={usedWindows}
          createWindow={createWindow}
          loadLayout={loadLayout}
          duplicateLayout={duplicateLayout}
          renameLayout={renameLayout}
          deleteLayout={deleteLayout}
          viewerState={viewerState}
          isPaused={areVideosPaused}
          hasOnlyOneStream={hasOnlyOneStream}
        />
        <ZiumOffsetsOverwriteOnStartDialog
          isOpen={ziumOffsetsDialogState.isOpen}
          onClose={ziumOffsetsDialogState.onClose}
          onApply={ziumOffsetsDialogState.onApply}
        />
        <GlobalShortcutsSnackbar />
      </div>
    </StreamPickerProvider>
  );
}, deepEqual);

export default Viewer;
