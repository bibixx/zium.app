interface ZiumOffsetsDTO {
  timestamp: number;
  data: Record<string, number>;
}

export const fetchZiumOffsets = async (raceId: string, signal: AbortSignal): Promise<ZiumOffsetsDTO | null> => {
  const response = await fetch(`${import.meta.env.VITE_OFFSETS_BASE_URL}/${raceId}.json`, { signal });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  return body;
};
