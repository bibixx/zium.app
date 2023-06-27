import { ziumOffsetsInfoValidator } from "./useZiumOffsetsInfo.validator";

export const fetchZiumOffsetsInfo = async (signal: AbortSignal) => {
  const response = await fetch(`${import.meta.env.VITE_OFFSETS_BASE_URL}/index.json`, { signal });

  if (!response.ok) {
    return [];
  }

  const body = await response.json();
  const parsedBody = ziumOffsetsInfoValidator.safeParse(body);

  if (!parsedBody.success) {
    return [];
  }

  return parsedBody.data;
};
