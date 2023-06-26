import { ziumOffsetsValidator } from "./useZiumOffsets.validator";

export const fetchZiumOffsets = async (raceId: string, signal: AbortSignal) => {
  const response = await fetch(`${import.meta.env.VITE_OFFSETS_BASE_URL}/${raceId}.json`, { signal });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  const parsedBody = ziumOffsetsValidator.safeParse(body);

  if (!parsedBody.success) {
    return null;
  }

  return parsedBody.data;
};
