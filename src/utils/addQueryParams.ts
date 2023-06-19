export const addQueryParams = (url: string, params: Record<string, string | number>) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => queryParams.set(key, String(value)));

  return `${url}?${queryParams.toString()}`;
};
