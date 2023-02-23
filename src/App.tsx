import React from "react";
import { ViewerWithState } from "./views/Viewer/Viewer";

import { useHasCompanion } from "./hooks/useHasCompanion";
import { NoCompanion } from "./views/NoCompanion/NoCompanion";
import { assertNever } from "./utils/assertNever";
import { useLoggedInState } from "./hooks/useLoggedInState";
import { LogIn } from "./views/LogIn/LogIn";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Races } from "./views/Races/Races";
import classNames from "classnames";
import { HeightDebugger } from "./components/HeightDebugger/HeightDebugger";
import { useDebug } from "./hooks/useDebug/useDebug";

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
    <div className={classNames({ debug: isDebugMode })}>
      {isDebugMode && <HeightDebugger />}
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
    </div>
  );
}
