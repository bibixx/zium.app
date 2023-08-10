import { captureMessage } from "@sentry/browser";

export const captureWarning = (message: string, extra?: Record<string, unknown>) => {
  console.warn(message, extra);
  captureMessage(message, {
    extra,
    level: "warning",
  });
};
