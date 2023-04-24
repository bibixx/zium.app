import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import classNames from "classnames";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ViewerWithState } from "./views/Viewer/Viewer";

import { useHasCompanion } from "./hooks/useHasCompanion";
import { NoCompanion } from "./views/NoCompanion/NoCompanion";
import { assertNever } from "./utils/assertNever";
import { useLoggedInState } from "./hooks/useLoggedInState";
import { LogIn } from "./views/LogIn/LogIn";
import { Races } from "./views/Races/Races";
import { DebugWindow } from "./components/DebugWindow/DebugWindow";
import { useDebug } from "./hooks/useDebug/useDebug";
import { SHEET_PORTAL_ID } from "./constants/portals";
import { HotkeysStackWithinHotkeysProvider } from "./hooks/useHotkeysStack/useHotkeysStack";
import { DEFAULT_SCOPE } from "./hooks/useScopedHotkeys/useScopedHotkeys";

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
  const isDebugMode = useDebug();

  return (
    <HotkeysProvider initiallyActiveScopes={[DEFAULT_SCOPE]}>
      <HotkeysStackWithinHotkeysProvider>
        <div className={classNames({ debug: isDebugMode })}>
          {isDebugMode && <DebugWindow />}

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
          <div id={SHEET_PORTAL_ID} />
        </div>
      </HotkeysStackWithinHotkeysProvider>
    </HotkeysProvider>
  );
}
