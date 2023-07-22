import { init } from "@sentry/browser";
import { z } from "zod";

const isString = (v: unknown) => z.string().safeParse(v).success;

export const setupSentry = () => {
  const releaseName = import.meta.env.VITE_GLITCH_TIP_RELEASE_NAME;
  const dsn = import.meta.env.VITE_GLITCH_TIP_DSN;
  const environment = import.meta.env.VITE_GLITCH_TIP_ENVIRONMENT;

  if (!isString(releaseName) || !isString(dsn) || !isString(environment)) {
    return;
  }

  init({
    dsn: dsn,
    environment,
    release: releaseName,
  });
};
