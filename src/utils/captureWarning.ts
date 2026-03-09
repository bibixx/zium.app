import posthog from "posthog-js";

export const captureWarning = (message: string, extra?: Record<string, unknown>) => {
  console.warn(message, extra);
  posthog.captureException(new Error(message), { level: "warning", ...extra });
};
