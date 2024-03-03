import { defaultHeaders } from "./apiDefaultHeaders";

export const fetchJSON = (url: string, init: RequestInit | undefined, signal: AbortSignal): Promise<unknown> =>
  fetch(`https://f1tv.formula1.com${url}`, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...init?.headers,
    },
    signal,
  }).then((res) => res.json());
