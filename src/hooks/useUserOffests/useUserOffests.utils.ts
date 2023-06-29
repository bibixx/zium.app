import { safeJSONParse } from "../../utils/safeJSONParse";
import { UserOffsets } from "./useUserOffests";
import { localStorageOffsetsValidator } from "./useUserOffests.validator";

const OFFSETS_LOCAL_STORAGE_KEY_PREFIX = "offsets_";

const getStorageKey = (raceId: string) => `${OFFSETS_LOCAL_STORAGE_KEY_PREFIX}${raceId}`;

export const getInitialOffsets = (raceId: string | undefined) => {
  if (raceId == null) {
    return null;
  }

  const storageKey = getStorageKey(raceId);
  const layoutFromStorage = localStorage.getItem(storageKey) as string | null;

  if (layoutFromStorage != null) {
    const data = safeJSONParse(layoutFromStorage);
    const parsedData = localStorageOffsetsValidator.safeParse(data);

    if (parsedData.success) {
      localStorage.setItem(storageKey, JSON.stringify(parsedData.data));

      return parsedData.data;
    }
  }

  localStorage.removeItem(storageKey);
  return null;
};

export const saveOffsets = (raceId: string | undefined, offsets: UserOffsets) => {
  if (raceId == null) {
    return;
  }

  localStorage.setItem(getStorageKey(raceId), JSON.stringify(offsets));
};
