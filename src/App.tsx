import React from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ViewerWithState } from "./views/Viewer/Viewer";

import { useHasCompanion } from "./hooks/useHasCompanion";
import { NoCompanion } from "./views/NoCompanion/NoCompanion";
import { assertNever } from "./utils/assertNever";
import { useLoggedInState } from "./hooks/useLoggedInState";
import { LogIn } from "./views/LogIn/LogIn";
import { Races } from "./views/Races/Races";
import { OVERLAYS_PORTAL_ID } from "./constants/portals";
import { HotkeysStackWithinHotkeysProvider } from "./hooks/useHotkeysStack/useHotkeysStack";
import { DEFAULT_SCOPE } from "./hooks/useScopedHotkeys/useScopedHotkeys";
import { FeatureFlagsProvider } from "./hooks/useFeatureFlags/useFeatureFlags";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { NotSupported } from "./views/NotSupported/NotSupported";
import { isSupportedBrowser } from "./utils/platform";
import { SnackbarsProvider } from "./components/Snackbar/SnackbarsProvider";
import { AnalyticsContextProvider } from "./hooks/useAnalytics/useAnalytics";
import { PrivacyPolicy } from "./views/PrivacyPolicy/PrivacyPolicy";
import { DebugPanel } from "./components/DebugPanel/DebugPanel";

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

  if (loggedInState === "loading") {
    return null;
  }

  if (loggedInState === "loggedIn") {
    return <Outlet />;
  }

  if (loggedInState === "loggedOut") {
    return <LogIn />;
  }

  return assertNever(loggedInState);
};

export default function App() {
  return (
    <AnalyticsContextProvider>
      <ErrorBoundary>
        <HotkeysProvider initiallyActiveScopes={[DEFAULT_SCOPE]}>
          <HotkeysStackWithinHotkeysProvider>
            <BrowserRouter>
              <SnackbarsProvider>
                <FeatureFlagsProvider>
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
                </FeatureFlagsProvider>
              </SnackbarsProvider>
            </BrowserRouter>
          </HotkeysStackWithinHotkeysProvider>
        </HotkeysProvider>
      </ErrorBoundary>
    </AnalyticsContextProvider>
  );
}
