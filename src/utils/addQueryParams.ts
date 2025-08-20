import { safeURLParse } from "./safeURLParse";

const INVALID_URL = "https://domain.invalid";
export const addQueryParams = (url: string, params: Record<string, string | number>) => {
  const urlObject = safeURLParse(url, INVALID_URL);

  if (urlObject === null) {
    return url;
  }

  Object.entries(params).forEach(([key, value]) => urlObject.searchParams.set(key, String(value)));

  if (urlObject.origin !== INVALID_URL) {
    return urlObject.toString();
  }

  return urlObject.toString().substring(INVALID_URL.length);
};
