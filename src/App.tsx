import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const WithLoggedIn = ({ children }: React.PropsWithChildren<unknown>) => {
  const loggedInState = useLoggedInState();

  if (loggedInState === "loading") {
    return null;
  }

  if (loggedInState === "loggedIn") {
    return <>{children}</>;
  }

  if (loggedInState === "loggedOut") {
    return <LogIn />;
  }

  return assertNever(loggedInState);
};

export default function App() {
  return (
    <HotkeysProvider initiallyActiveScopes={[DEFAULT_SCOPE]}>
      <HotkeysStackWithinHotkeysProvider>
        <DebugProvider>
          <DebugWindow />
          <WithCompanion>
            <WithLoggedIn>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Races />} />
                  <Route path="/race/:raceId" element={<ViewerWithState />} />
                </Routes>
              </BrowserRouter>
            </WithLoggedIn>
          </WithCompanion>
          <div id={OVERLAYS_PORTAL_ID} />
        </DebugProvider>
      </HotkeysStackWithinHotkeysProvider>
    </HotkeysProvider>
  );
}
