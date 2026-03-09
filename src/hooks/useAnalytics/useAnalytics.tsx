import posthog from "posthog-js";
import { Location, useLocation } from "react-router-dom";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { assertNotNullable } from "../../utils/assertExistence";
import { setInitialWasConsentGiven, wasConsentGivenStorageClient } from "./useAnalytics.utils";

let previousPath: string | null = null;
let previousTitle: string | null = null;

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

  const track = useCallback(
    (location: Location, title?: string) => {
      const currentPath = location.pathname + location.search;
      const currentTitle = title ?? document.title;

      if (previousPath === currentPath && previousTitle === currentTitle) {
        return;
      }

      posthog.capture("$pageview", {
        $current_url: currentPath,
        title: currentTitle,
      });

      previousPath = currentPath;
      previousTitle = currentTitle;
    },
    [],
  );

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

  useEffect(() => {
    setInitialWasConsentGiven(wasConsentGiven);

    if (wasConsentGiven) {
      posthog.opt_in_capturing();
    } else if (wasConsentGiven === false) {
      posthog.opt_out_capturing();
    }
  }, [wasConsentGiven]);

  return (
    <AnalyticsContext.Provider value={{ wasConsentGiven, setWasConsentGiven }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
