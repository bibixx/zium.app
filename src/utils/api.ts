const defaultOptions: Partial<RequestInit> = {
  referrer: "",
};

export const fetchJSON = (url: string, init: RequestInit | undefined, signal: AbortSignal): Promise<unknown> =>
  fetch(`https://f1tv.formula1.com${url}`, { ...defaultOptions, ...init, signal }).then((res) => res.json());
