export const fetchJSON = (
  url: string,
  init: RequestInit | undefined,
  signal: AbortSignal,
) =>
  fetch(`https://f1tv.formula1.com${url}`, { ...init, signal }).then((res) =>
    res.json(),
  );
