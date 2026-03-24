import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import deepEqual from "fast-deep-equal/es6";
import { Transition, TransitionGroup } from "react-transition-group";
import { VideoPlayerRef } from "../../components/VideoPlayer/VideoPlayer.types";
import { GridWindow } from "../../types/GridWindow";
import { MainVideoWindow } from "../../components/VideoWindow/MainVideoWindow/MainVideoWindow";
import { DriverVideoWindow } from "../../components/VideoWindow/DriverVideoWindow/DriverVideoWindow";
import { assertNever } from "../../utils/assertNever";
import { DataChannelVideoWindow } from "../../components/VideoWindow/DataChannelVideoWindow/DataChannelVideoWindow";
import { LiveTimingWindow } from "../../components/VideoWindow/LiveTimingWindow/LiveTimingWindow";
import {
  PlaybackOffsets,
  RaceInfo,
  StreamsStateStreamsData,
} from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { DriverTrackerVideoWindow } from "../../components/VideoWindow/DriverTrackerVideoWindow/DriverTrackerVideoWindow";
import { RnDWindow } from "../../components/RnDWindow/RnDWindow";
import { Dimensions } from "../../types/Dimensions";
import { ChosenValueType, StreamPickerProvider } from "../../hooks/useStreamPicker/useStreamPicker";
import { StreamPicker } from "../../components/StreamPicker/StreamPicker";
import { Player } from "../../components/Player/Player";
import { isNotNullable } from "../../utils/isNotNullable";
import { CookieBanner } from "../../components/CookieBanner/CookieBanner";
import { GlobalShortcutsSnackbar } from "../../components/ShortcutsSnackbar/ShortcutsSnackbar";
import { toggleFullScreen } from "../../utils/toggleFullScreen";
import { registerSyncDebugSources, unregisterSyncDebugSources } from "../../components/DebugPanel/syncDebugState";
import { getWindowStreamMap, getAvailableDrivers } from "./Viewer.utils";
import { useGrid } from "./hooks/useGrid";
import styles from "./Viewer.module.scss";
import { useVideoAudio } from "./hooks/useVideoAudio";
import { useSyncVideos } from "./hooks/useSyncVideos";
import { useStaggeredLoad, DeferLoadGate } from "./hooks/useStaggeredLoad";
import { BackgroundDots } from "./BackgroundDots/BackgroundDots";
import { useViewerState } from "./hooks/useViewerState/useViewerState";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useCmdTutorial } from "./hooks/useCmdTutorial";
import { GridLayoutFillMode } from "./hooks/useViewerState/useViewerState.utils";
import { useNotifyAboutNewEvent } from "./hooks/useNotifyAboutNewEvent/useNotifyAboutNewEvent";

interface ViewerProps {
  streams: StreamsStateStreamsData;
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

  const [areVideosPaused, setAreVideosPaused] = useState(!isLive);
  const { audioFocusedWindow, onWindowAudioFocus, setVolume, volume, internalVolume, setIsMuted, isMuted } =
    useVideoAudio({
      windows,
    });

  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  // Derive a stable key that only changes when window identity changes (type, ID, streamId/driverId),
  // NOT when layout positions change. This prevents getLayoutChild from being recreated on drag/resize.
  const windowStreamMapKey = useMemo(
    () =>
      windows
        .map((w) => {
          if (w.type === "main")
            return `${w.id}:main:${w.streamId}:${w.streamId === "international" ? w.audioLanguage : ""}`;
          if (w.type === "driver") return `${w.id}:driver:${w.driverId}`;
          return `${w.id}:${w.type}`;
        })
        .join(","),
    [windows],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const windowStreamMap = useMemo(() => getWindowStreamMap(windowsRef.current, streams), [windowStreamMapKey, streams]);
  const windowVideojsRefMapRef = useRef<Record<string, VideoPlayerRef | null>>({});
  const [mainVideoPlayer, setMainVideoPlayer] = useState<VideoPlayerRef | null>(null);
  const { onResize } = useCmdTutorial();
  useEffect(function closeFullScreenWhenLeavingViewer() {
    return () => {
      if (document.fullscreenElement) {
        toggleFullScreen();
      }
    };
  }, []);

  // Stabilize individual GridWindow references — structuredClone in the reducer creates new
  // objects even when content is identical. By reusing old references, memo on children can bail out.
  const prevWindowsMapRef = useRef<Record<string, GridWindow>>({});
  const windowsMap = useMemo((): Record<string, GridWindow> => {
    const prev = prevWindowsMapRef.current;
    const result: Record<string, GridWindow> = {};
    for (const w of windows) {
      result[w.id] = prev[w.id] && deepEqual(prev[w.id], w) ? prev[w.id] : w;
    }
    prevWindowsMapRef.current = result;
    return result;
  }, [windows]);

  const mainVideoWindowRefCallback = useCallback((ref: VideoPlayerRef | null) => {
    const mainWindow = windowsRef.current.find((w) => w.type === "main");
    if (mainWindow) {
      windowVideojsRefMapRef.current[mainWindow.id] = ref;
    }
    setMainVideoPlayer(ref);
  }, []);

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
      ...streams.defaultStreams,
      streams.driverTrackerStream,
      streams.dataChannelStream,
      ...streams.driverStreams,
    ].filter(isNotNullable);

    return allStreams.length === 1;
  }, [streams]);
  // --- Stable callbacks for child components (accept windowId to avoid per-window closures) ---
  const onDeleteWindow = useCallback(
    (windowId: string) => {
      dispatch({ type: "deleteWindow", windowId });
    },
    [dispatch],
  );

  const onUpdateFillMode = useCallback(
    (windowId: string, fillMode: GridLayoutFillMode) => {
      dispatch({ type: "updateFillMode", id: windowId, fillMode });
    },
    [dispatch],
  );

  const onWindowSourceChange = useCallback(
    (windowId: string, data: ChosenValueType) => {
      if (data.type === "main") {
        if (data.streamId === "f1live") {
          dispatch({ type: "updateWindow", window: { type: "main", streamId: "f1live", id: windowId } });
          return;
        }

        if (data.streamId === "international") {
          dispatch({
            type: "updateWindow",
            window: { type: "main", streamId: "international", audioLanguage: data.audioLanguage, id: windowId },
          });
          return;
        }

        return assertNever(data);
      }

      if (data.type === "data") {
        dispatch({ type: "updateWindow", window: { type: data.streamId, id: windowId } });
        return;
      }

      if (data.type === "driver") {
        dispatch({ type: "updateWindow", window: { type: "driver", driverId: data.driverId, id: windowId } });
        return;
      }

      return assertNever(data);
    },
    [dispatch],
  );

  const focusMainWindow = useCallback(() => {
    const mainWindow = windowsRef.current.find((w) => w.type === "main");
    if (mainWindow) {
      onWindowAudioFocus(mainWindow.id);
    }
  }, [onWindowAudioFocus]);

  const getLayoutChild = (gridWindow: GridWindow, fillMode: GridLayoutFillMode) => {
    const setRef = (video: VideoPlayerRef | null) => {
      windowVideojsRefMapRef.current[gridWindow.id] = video;
    };

    if (gridWindow.type === "main") {
      return (
        <MainVideoWindow
          ref={mainVideoWindowRefCallback}
          gridWindow={gridWindow}
          onSourceChange={onWindowSourceChange}
          onPlayingChange={setAreVideosPaused}
          isPaused={areVideosPaused}
          isAudioFocused={audioFocusedWindow === gridWindow.id}
          onWindowAudioFocus={onWindowAudioFocus}
          volume={volume}
          setVolume={setVolume}
          streamUrl={windowStreamMap[gridWindow.streamId]}
          fillMode={fillMode}
          updateFillMode={onUpdateFillMode}
          hasOnlyOneStream={hasOnlyOneStream}
          defaultStreams={streams.defaultStreams}
        />
      );
    }

    if (gridWindow.type === "driver") {
      return (
        <DriverVideoWindow
          gridWindow={gridWindow}
          ref={setRef}
          availableDrivers={availableDrivers}
          onDriverChange={onWindowSourceChange}
          isPaused={areVideosPaused}
          isAudioFocused={audioFocusedWindow === gridWindow.id}
          onWindowAudioFocus={onWindowAudioFocus}
          focusMainWindow={focusMainWindow}
          volume={volume}
          streamUrl={windowStreamMap[gridWindow.id]}
          onDelete={onDeleteWindow}
          hasOnlyOneStream={hasOnlyOneStream}
          fillMode={fillMode}
          updateFillMode={onUpdateFillMode}
        />
      );
    }

    if (gridWindow.type === "driver-tracker") {
      return (
        <DriverTrackerVideoWindow
          gridWindow={gridWindow}
          onSourceChange={onWindowSourceChange}
          ref={setRef}
          isPaused={areVideosPaused}
          streamUrl={windowStreamMap[gridWindow.id]}
          onDelete={onDeleteWindow}
          fillMode={fillMode}
          updateFillMode={onUpdateFillMode}
        />
      );
    }

    if (gridWindow.type === "data-channel") {
      return (
        <DataChannelVideoWindow
          gridWindow={gridWindow}
          onSourceChange={onWindowSourceChange}
          ref={setRef}
          isPaused={areVideosPaused}
          streamUrl={windowStreamMap[gridWindow.id]}
          onDelete={onDeleteWindow}
          fillMode={fillMode}
          updateFillMode={onUpdateFillMode}
        />
      );
    }

    if (gridWindow.type === "live-timing") {
      return (
        <LiveTimingWindow
          gridWindow={gridWindow}
          onSourceChange={onWindowSourceChange}
          onDelete={onDeleteWindow}
          fillMode={fillMode}
          updateFillMode={onUpdateFillMode}
          mainVideoPlayer={mainVideoPlayer}
          season={season}
          raceStartDate={raceInfo.startDate}
          genre={raceInfo.genre}
          isLive={isLive}
        />
      );
    }

    return assertNever(gridWindow);
  };

  const { syncStateRef, manifestOffsetsRef, presentationStartTimesRef } = useSyncVideos({
    windows,
    windowPlayerRefMapRef: windowVideojsRefMapRef,
    isLive,
    playbackOffsets,
  });
  const { isWindowReady } = useStaggeredLoad(windows, mainVideoPlayer);

  useEffect(() => {
    registerSyncDebugSources(syncStateRef, windowVideojsRefMapRef, manifestOffsetsRef, presentationStartTimesRef);
    return unregisterSyncDebugSources;
  }, [syncStateRef, manifestOffsetsRef, presentationStartTimesRef]);

  useGlobalShortcuts(mainVideoPlayer, setAreVideosPaused, setIsMuted);
  useNotifyAboutNewEvent(raceId);

  const globalFeeds = useMemo(
    () => [streams.driverTrackerStream, streams.dataChannelStream].filter(isNotNullable),
    [streams.dataChannelStream, streams.driverTrackerStream],
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
                    <DeferLoadGate shouldDefer={!isWindowReady(gridWindow.id)}>
                      {getLayoutChild(gridWindow, l.fillMode)}
                    </DeferLoadGate>
                  </RnDWindow>
                )}
              </Transition>
            );
          })}
        </TransitionGroup>
        <StreamPicker
          availableDrivers={availableDrivers}
          globalFeeds={globalFeeds}
          mainFeeds={streams.defaultStreams}
        />
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
          hasUsedAllStreams={usedWindows.length >= availableDrivers.length + globalFeeds.length}
        />
        <GlobalShortcutsSnackbar />
      </div>
    </StreamPickerProvider>
  );
}, deepEqual);

export default Viewer;
