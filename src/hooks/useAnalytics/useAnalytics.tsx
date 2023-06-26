import PiwikReactRouter from "piwik-react-router";
import { Location, useLocation } from "react-router-dom";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getInitialWasConsentGiven, setInitialWasConsentGiven } from "./useAnalytics.utils";

const BASE_URL = import.meta.env.VITE_MATOMO_URL_BASE;
const SITE_ID = import.meta.env.VITE_MATOMO_SITE_ID;

let previousPath: string | null = null;
let previousTitle: string | null = null;

type PiwikReactRouter = ReturnType<typeof PiwikReactRouter>;
type PiwikPush = PiwikReactRouter["push"];
type PiwikSetUserId = PiwikReactRouter["setUserId"];

export const useAnalytics = () => {
  const analyticsContext = useContext(AnalyticsContext);

  if (analyticsContext === null) {
    throw new Error("Using uninitialised AnalyticsContext");
  }

  const { piwik, wasConsentGiven, setWasConsentGiven } = analyticsContext;

  const push = useCallback((...args: Parameters<PiwikPush>) => piwik?.push(...args), [piwik]);
  const setUserId = useCallback((...args: Parameters<PiwikSetUserId>) => piwik?.setUserId(...args), [piwik]);

  const trackError = useCallback(
    (e: Error | unknown, eventName?: string) => {
      if (e instanceof Error) {
        push(["trackEvent", eventName ?? "JavaScript Error", e.message, e.stack]);
      } else {
        push(["trackEvent", eventName ?? "JavaScript Error", e]);
      }
    },
    [push],
  );

  const track = useCallback(
    (location: Location, title?: string) => {
      const currentPath = location.pathname + location.search;
      const currentTitle = title ?? document.title;

      if (previousPath === currentPath && previousTitle === currentTitle) {
        return;
      }

      push(["setDocumentTitle", title ?? document.title]);
      push(["setCustomUrl", currentPath]);
      push(["trackPageView"]);

      previousPath = currentPath;
      previousTitle = currentTitle;
    },
    [push],
  );

  const setConsent = useCallback(
    (consentGiven: boolean) => {
      setWasConsentGiven(consentGiven);
    },
    [setWasConsentGiven],
  );

  return useMemo(
    () => ({
      push,
      setUserId,
      trackError,
      track,
      setConsent,
      wasConsentGiven,
    }),
    [push, setUserId, trackError, track, setConsent, wasConsentGiven],
  );
};

export type Piwik = ReturnType<typeof useAnalytics>;

export const useTrackWithTitle = (title: string) => {
  const location = useLocation();
  const { track } = useAnalytics();

  useEffect(() => {
    track(location, title);
  }, [location, title, track]);
};

interface AnalyticsContextType {
  piwik: PiwikReactRouter | null;
  wasConsentGiven: boolean | null;
  setWasConsentGiven: (wasConsentGiven: boolean | null) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsContextProviderProps {
  children: ReactNode;
}
export const AnalyticsContextProvider = ({ children }: AnalyticsContextProviderProps) => {
  const [wasConsentGiven, setWasConsentGiven] = useState<boolean | null>(getInitialWasConsentGiven());
  const piwik = useMemo(
    () =>
      BASE_URL != null && SITE_ID != null
        ? PiwikReactRouter({
            url: BASE_URL,
            siteId: SITE_ID,
            updateDocumentTitle: false,
            trackErrors: false,
            injectScript: true,
          })
        : null,
    [],
  );

  useEffect(() => {
    piwik?.push(["requireConsent"]);
    piwik?.push(["requireCookieConsent"]);
  }, [piwik]);

  useEffect(() => {
    setInitialWasConsentGiven(wasConsentGiven);

    if (wasConsentGiven) {
      piwik?.push(["setConsentGiven"]);
      piwik?.push(["setCookieConsentGiven"]);
    }
  }, [piwik, wasConsentGiven]);

  return (
    <AnalyticsContext.Provider value={{ wasConsentGiven, setWasConsentGiven, piwik }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
