import PiwikReactRouter from "piwik-react-router";
import { Location, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";

const BASE_URL = import.meta.env.VITE_MATOMO_URL_BASE;
const SITE_ID = import.meta.env.VITE_MATOMO_SITE_ID;

const piwikSingleton =
  BASE_URL != null && SITE_ID != null
    ? PiwikReactRouter({
        url: BASE_URL,
        siteId: SITE_ID,
        updateDocumentTitle: false,
        trackErrors: false,
        injectScript: true,
      })
    : null;
let previousPath: string | null = null;
let previousTitle: string | null = null;

type PiwikReactRouter = ReturnType<typeof PiwikReactRouter>;
type PiwikPush = PiwikReactRouter["push"];
type PiwikSetUserId = PiwikReactRouter["setUserId"];

export const useAnalytics = () => {
  const push = useCallback((...args: Parameters<PiwikPush>) => piwikSingleton?.push(...args), []);
  const setUserId = useCallback((...args: Parameters<PiwikSetUserId>) => piwikSingleton?.setUserId(...args), []);

  const trackError = useCallback(
    (e: Error, eventName?: string) => {
      push(["trackEvent", eventName ?? "JavaScript Error", e.message, e.stack]);
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

  return useMemo(
    () => ({
      push,
      setUserId,
      trackError,
      track,
    }),
    [push, setUserId, track, trackError],
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
