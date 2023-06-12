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
import { DebugWindow } from "./components/DebugWindow/DebugWindow";
import { OVERLAYS_PORTAL_ID } from "./constants/portals";
import { HotkeysStackWithinHotkeysProvider } from "./hooks/useHotkeysStack/useHotkeysStack";
import { DEFAULT_SCOPE } from "./hooks/useScopedHotkeys/useScopedHotkeys";
import { DebugProvider } from "./hooks/useDebug/useDebug";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { NotSupported } from "./views/NotSupported/NotSupported";

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

const isSupportedBrowser = navigator.userAgent.includes("Chrome");

export default function App() {
  return (
    <ErrorBoundary>
      <HotkeysProvider initiallyActiveScopes={[DEFAULT_SCOPE]}>
        <HotkeysStackWithinHotkeysProvider>
          <DebugProvider>
            <DebugWindow />
            {isSupportedBrowser ? (
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <WithCompanion>
                        <WithLoggedIn />
                      </WithCompanion>
                    }
                  >
                    <Route path="/" element={<Races />} />
                    <Route path="/race/:raceId" element={<ViewerWithState />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            ) : (
              <NotSupported />
            )}
            <div id={OVERLAYS_PORTAL_ID} />
          </DebugProvider>
        </HotkeysStackWithinHotkeysProvider>
      </HotkeysProvider>
    </ErrorBoundary>
  );
}
