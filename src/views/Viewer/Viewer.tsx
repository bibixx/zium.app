import { useCallback, useMemo, useReducer, useRef } from "react";
import GridLayout from "react-grid-layout";
import { useWindowSize } from "../../hooks/useWindowSize";
import { GridWindow } from "../../types/GridWindow";
import {
  getInitialState,
  windowGridReducer,
} from "../../utils/windowGridStore";
import { MainVideoWindow } from "../../components/VideoWindow/MainVideoWindow";
import { VideoJsPlayer } from "video.js";
import { DriverVideoWindow } from "../../components/VideoWindow/DriverVideoWindow";
import { assertNever } from "../../utils/assertNever";
import { DataChannelVideoWindow } from "../../components/VideoWindow/DataChannelVideoWindow";
import { StreamsStateData } from "../../hooks/useRaceDetails/useRaceDetails.types";
import { combineWindowsWithStreams, getAvailableDrivers } from "./Viewer.utils";
import { useSyncVideos } from "./Viewer.hooks";
import { DriverTrackerVideoWindow } from "../../components/VideoWindow/DriverTrackerVideoWindow";
import { useRaceDetails } from "../../hooks/useRaceDetails/useRaceDetails";

const COLUMNS = 100;
const ROWS = 100;

interface ViewerProps {
  streams: StreamsStateData;
}

export const Viewer = ({ streams }: ViewerProps) => {
  const { width, height } = useWindowSize();

  const [{ layout, windows }, dispatch] = useReducer(
    windowGridReducer,
    getInitialState(),
  );

  const windowsWithUrls = useMemo(
    () => combineWindowsWithStreams(windows, streams),
    [windows, streams],
  );
  const windowVideojsRefMapRef = useRef<Record<string, VideoJsPlayer | null>>(
    {},
  );

  const windowsMap = useMemo((): Record<string, GridWindow> => {
    const entries = windowsWithUrls.map((w) => [w.id, w]);
    return Object.fromEntries(entries);
  }, [windowsWithUrls]);

  const onLayoutChange = (layout: GridLayout.Layout[]) => {
    dispatch({
      type: "updateLayout",
      layout,
    });
  };

  const executeOnAll = (
    cb: (player: VideoJsPlayer) => void,
    callerId: string,
  ) => {
    windowsWithUrls.forEach((w) => {
      const player = windowVideojsRefMapRef.current[w.id];

      if (w.id === callerId || player == null) {
        return;
      }

      cb(player);
    });
  };

  const availableDrivers = useMemo(
    () => getAvailableDrivers(streams),
    [streams],
  );

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
            executeOnAll={executeOnAll}
            availableDrivers={availableDrivers}
            onDriverChange={onDriverChange}
          />
        );
      }

      if (gridWindow.type === "driver-tracker") {
        return (
          <DriverTrackerVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            executeOnAll={executeOnAll}
          />
        );
      }

      if (gridWindow.type === "data-channel") {
        return (
          <DataChannelVideoWindow
            gridWindow={gridWindow}
            ref={setRef}
            executeOnAll={executeOnAll}
          />
        );
      }

      return assertNever(gridWindow);
    },
    [executeOnAll],
  );

  useSyncVideos({ windows, windowVideojsRefMapRef });

  return (
    <div className="viewer-background">
      <GridLayout
        layout={layout}
        cols={COLUMNS}
        rowHeight={height / ROWS}
        maxRows={ROWS}
        width={width}
        // compactType={null}
        // preventCollision
        margin={[0, 0]}
        resizeHandles={["s", "e", "se"]}
        onLayoutChange={onLayoutChange}
        isBounded
        autoSize={false}
      >
        {layout.map((l) => {
          const gridWindow = windowsMap[l.i];

          return <div key={gridWindow.id}>{getLayoutChild(gridWindow)}</div>;
        })}
      </GridLayout>
    </div>
  );
};

export const ViewerWithState = () => {
  const state = useRaceDetails("1000005659");

  // const state = useRaceDetails("1000005104");

  if (state.state === "error") {
    return <div>Error occurred</div>;
  }

  if (state.state === "loading") {
    return <div>Loading...</div>;
  }

  return <Viewer streams={state.data} />;
};
