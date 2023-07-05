export const addQueryParams = (url: string, params: Record<string, string | number>) => {
  const urlObject = new URL(url);
  Object.entries(params).forEach(([key, value]) => urlObject.searchParams.set(key, String(value)));

  return urlObject.toString();
};
