import { posthog } from "posthog-js";
import { Location, useLocation } from "react-router-dom";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { assertNotNullable } from "../../utils/assertExistence";
import { useLoggedInState } from "../useLoggedInState";
import { setInitialWasConsentGiven, wasConsentGivenStorageClient } from "./useAnalytics.utils";

let previousPath: string | null = null;
let previousTitle: string | null = null;

const capturePageview = (path: string, title: string) => {
  posthog.capture("$pageview", {
    $current_url: path,
    title,
  });
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  assertNotNullable(context, "Using uninitialised AnalyticsContext");

  const { wasConsentGiven, setWasConsentGiven } = context;

  const capture = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    posthog.capture(eventName, properties);
  }, []);

  const identify = useCallback((userId: string) => {
    posthog.identify(userId);
  }, []);

  const track = useCallback((location: Location, title?: string) => {
    const currentPath = location.pathname + location.search;
    const currentTitle = title ?? document.title;

    if (previousPath === currentPath && previousTitle === currentTitle) {
      return;
    }

    capturePageview(currentPath, currentTitle);

    previousPath = currentPath;
    previousTitle = currentTitle;
  }, []);

  const setConsent = useCallback(
    (consentGiven: boolean) => {
      setWasConsentGiven(consentGiven);
    },
    [setWasConsentGiven],
  );

  return useMemo(
    () => ({
      capture,
      identify,
      track,
      setConsent,
      wasConsentGiven,
    }),
    [capture, identify, track, setConsent, wasConsentGiven],
  );
};

export type Analytics = ReturnType<typeof useAnalytics>;

export const useTrackWithTitle = (title: string) => {
  const location = useLocation();
  const { track } = useAnalytics();

  useEffect(() => {
    track(location, title);
  }, [location, title, track]);
};

interface AnalyticsContextType {
  wasConsentGiven: boolean | null;
  setWasConsentGiven: (wasConsentGiven: boolean | null) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsContextProviderProps {
  children: ReactNode;
}
export const AnalyticsContextProvider = ({ children }: AnalyticsContextProviderProps) => {
  const [wasConsentGiven, setWasConsentGiven] = useState<boolean | null>(wasConsentGivenStorageClient.get());
  const loggedInState = useLoggedInState();
  const userId = loggedInState.type === "loggedIn" ? loggedInState.userId : null;
  const isLoggedOut = loggedInState.type === "loggedOut";
  const wasIdentified = useRef(false);

  useEffect(() => {
    setInitialWasConsentGiven(wasConsentGiven);

    if (wasConsentGiven) {
      // PostHog remembers the opt-in, so only act on new consent. Opting in again sends another $opt_in event.
      if (!posthog.has_opted_in_capturing()) {
        posthog.opt_in_capturing();

        // The pageview of the page where consent was given was dropped while opted out
        if (previousPath !== null && previousTitle !== null) {
          capturePageview(previousPath, previousTitle);
        }
      }
    } else if (wasConsentGiven === false) {
      posthog.opt_out_capturing();
    }
  }, [wasConsentGiven]);

  // Has to stay in the provider, after the effect above: child effects run first, so identifying
  // from a child would happen before opt-in and PostHog would drop the $identify event.
  useEffect(() => {
    if (!wasConsentGiven) {
      return;
    }

    if (userId != null) {
      posthog.identify(userId);
      wasIdentified.current = true;
    } else if (isLoggedOut && wasIdentified.current) {
      posthog.reset();
      // reset() also forgets the opt-in and the super properties set by useLoggedInStateExecutor
      posthog.opt_in_capturing({ captureEventName: false });
      posthog.register({ f1TvTier: "None", f1TvRawTier: null });
      wasIdentified.current = false;
    }
  }, [wasConsentGiven, userId, isLoggedOut]);

  return (
    <AnalyticsContext.Provider value={{ wasConsentGiven, setWasConsentGiven }}>{children}</AnalyticsContext.Provider>
  );
};
