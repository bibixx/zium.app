import React, { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { useHotkeysExecutor } from "./hooks/useHotkeys/useHotkeys";
import { ViewerWithState, preloadViewer } from "./views/Viewer/ViewerWithState";
import { useHasCompanion } from "./hooks/useHasCompanion";
import { NoCompanion } from "./views/NoCompanion/NoCompanion";
import { assertNever } from "./utils/assertNever";
import { useLoggedInState, useLoggedInStateExecutor } from "./hooks/useLoggedInState";
import { LogIn } from "./views/LogIn/LogIn";
import { Races } from "./views/Races/Races";
import { OVERLAYS_PORTAL_ID } from "./constants/portals";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { NotSupported } from "./views/NotSupported/NotSupported";
import { isSupportedBrowser } from "./utils/platform";
import { AnalyticsContextProvider } from "./hooks/useAnalytics/useAnalytics";
import { PrivacyPolicy } from "./views/PrivacyPolicy/PrivacyPolicy";
import { DebugPanel } from "./components/DebugPanel/DebugPanel";
import { SnackbarsList } from "./components/Snackbar/SnackbarsList";
import { FeatureFlagsWrapper } from "./hooks/useFeatureFlags/FeatureFlagsWrapper";
import { ThemeProvider } from "./hooks/useTheme/useTheme";

const WithCompanion = ({ children }: React.PropsWithChildren<unknown>) => {
  const companionState = useHasCompanion();

  if (companionState === "loading") {
    return null;
  }

  if (companionState === "hasCompanion") {
    return <>{children}</>;
  }

  if (companionState === "noCompanion") {
    return <NoCompanion />;
  }

  return assertNever(companionState);
};

const WithLoggedIn = () => {
  const loggedInState = useLoggedInState();

  if (loggedInState.type === "loading") {
    return null;
  }

  if (loggedInState.type === "loggedOut") {
    return <LogIn />;
  }

  if (loggedInState.type === "loggedIn") {
    return <Outlet />;
  }

  return assertNever(loggedInState);
};

function App() {
  useHotkeysExecutor();
  useLoggedInStateExecutor();

  useEffect(function preloadViewerEffect() {
    preloadViewer();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <FeatureFlagsWrapper>
          <Routes>
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {isSupportedBrowser ? (
              <Route
                path="/"
                element={
                  <WithCompanion>
                    <WithLoggedIn />
                    <DebugPanel />
                  </WithCompanion>
                }
              >
                <Route path="/" element={<Races />} />
                <Route path="/race/:raceId" element={<ViewerWithState />} />
              </Route>
            ) : (
              <Route path="/" element={<NotSupported />} />
            )}
          </Routes>
          <div id={OVERLAYS_PORTAL_ID} />
        </FeatureFlagsWrapper>
        <SnackbarsList />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <AnalyticsContextProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AnalyticsContextProvider>
  );
}
