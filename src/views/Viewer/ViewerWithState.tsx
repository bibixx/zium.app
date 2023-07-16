import { useParams } from "react-router-dom";
import cn from "classnames";
import { Suspense } from "react";
import { useVideoRaceDetails } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails";
import {
  GLOBAL_UI_VISIBILITY_CLASS_NAME,
  useViewerUIVisibilityState,
  ViewerUIVisibilityContext,
} from "../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { FullScreenError } from "../../components/FullScreenError/FullScreenError";
import { Loader } from "../../components/Loader/Loader";
import { TimedOutWrapper } from "../../components/TimedOutWrapper/TimedOutWrapper";
import { useTrackWithTitle } from "../../hooks/useAnalytics/useAnalytics";
import { CookieBanner } from "../../components/CookieBanner/CookieBanner";
import { UserOffsetsProvider } from "../../hooks/useUserOffests/useUserOffests";
import { lazyWithPreload } from "../../utils/lazyWithPreload";
import { useGrid } from "./hooks/useGrid";
import styles from "./Viewer.module.scss";
import { BackgroundDots } from "./BackgroundDots/BackgroundDots";

const { Component: Viewer, preload: preloadViewer } = lazyWithPreload(() => import("./Viewer"));

export { preloadViewer };
export const ViewerWithState = () => {
  const { raceId } = useParams();
  useTrackWithTitle(`Viewer: ${raceId}`);

  const state = useVideoRaceDetails(raceId as string);
  const viewerUIVisibilityState = useViewerUIVisibilityState();

  if (raceId == null) {
    return <FullScreenError error={null} />;
  }

  if (state.state === "error") {
    return <FullScreenError error={state.error} />;
  }

  if (state.state === "loading") {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <ViewerUIVisibilityContext.Provider value={viewerUIVisibilityState}>
        <UserOffsetsProvider raceId={raceId}>
          <div
            className={cn(styles.cursorWrapper, {
              [GLOBAL_UI_VISIBILITY_CLASS_NAME]: viewerUIVisibilityState.isUIVisible,
            })}
          >
            <Viewer
              streams={state.streams}
              season={state.season}
              isLive={state.isLive}
              raceInfo={state.raceInfo}
              playbackOffsets={state.playbackOffsets}
              raceId={raceId}
            />
          </div>
        </UserOffsetsProvider>
      </ViewerUIVisibilityContext.Provider>
    </Suspense>
  );
};

const LoadingState = () => {
  const { baseGrid } = useGrid();

  return (
    <div className={styles.backgroundWrapper}>
      <CookieBanner position="top" mode="fixed" />

      <BackgroundDots baseGrid={baseGrid} />

      <TimedOutWrapper timeout={500}>
        <div className={styles.loaderWrapper}>
          <Loader width={128} />
        </div>
      </TimedOutWrapper>
    </div>
  );
};
