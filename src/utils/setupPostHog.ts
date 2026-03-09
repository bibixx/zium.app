import posthog from "posthog-js";
import { z } from "zod";

const isString = (v: unknown) => z.string().safeParse(v).success;

export const setupPostHog = () => {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST;

  if (!isString(apiKey)) {
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost || "https://us.i.posthog.com",
    opt_out_capturing_by_default: true,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
  });
};
