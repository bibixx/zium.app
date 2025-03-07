import * as Sentry from "@sentry/react";
import { z } from "zod";

const isString = (v: unknown) => z.string().safeParse(v).success;

export const setupSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!isString(dsn)) {
    return;
  }

  Sentry.init({
    dsn,
    integrations: [],
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};
