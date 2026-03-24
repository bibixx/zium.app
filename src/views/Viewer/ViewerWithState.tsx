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
import { assertNotNullable } from "../../utils/assertExistence";
import { canAccessEvent } from "../../utils/canAccessEvent";
import { useCurrentTier } from "../../hooks/useLoggedInState";
import { NoViewerAccess } from "../../components/NoViewerAccess/NoViewerAccess";
import { PlayerShell } from "../../components/Player/PlayerShell";
import { useGrid } from "./hooks/useGrid";
import styles from "./Viewer.module.scss";
import { BackgroundDots } from "./BackgroundDots/BackgroundDots";

const { Component: Viewer, preload: preloadViewer } = lazyWithPreload(() => import("./Viewer"));

export { preloadViewer };
export const ViewerWithState = () => {
  const { raceId } = useParams();
  const currentTier = useCurrentTier();
  assertNotNullable(raceId);

  useTrackWithTitle(`Viewer: ${raceId}`);
  const state = useVideoRaceDetails(raceId);
  const viewerUIVisibilityState = useViewerUIVisibilityState();

  if (raceId == null) {
    return <FullScreenError error={null} />;
  }

  if (state.state === "error") {
    return <FullScreenError error={state.error} />;
  }

  if (state.state === "loading") {
    return (
      <ViewerUIVisibilityContext.Provider value={viewerUIVisibilityState}>
        <LoadingState />
      </ViewerUIVisibilityContext.Provider>
    );
  }

  if (!canAccessEvent(currentTier, state.data.entitlement)) {
    return <NoViewerAccess currentTier={currentTier} />;
  }

  return (
    <ViewerUIVisibilityContext.Provider value={viewerUIVisibilityState}>
      <Suspense fallback={<LoadingState />}>
        <UserOffsetsProvider raceId={raceId}>
          <div
            className={cn(styles.cursorWrapper, {
              [GLOBAL_UI_VISIBILITY_CLASS_NAME]: viewerUIVisibilityState.isUIVisible,
            })}
          >
            <Viewer
              streams={state.data.streams}
              season={state.data.season}
              isLive={state.data.isLive}
              raceInfo={state.data.raceInfo}
              playbackOffsets={state.data.playbackOffsets}
              raceId={raceId}
            />
          </div>
        </UserOffsetsProvider>
      </Suspense>
    </ViewerUIVisibilityContext.Provider>
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
          <Loader width={64} />
        </div>
      </TimedOutWrapper>
      <PlayerShell />
    </div>
  );
};
