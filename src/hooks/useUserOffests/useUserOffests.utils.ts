import { LocalStorageClient } from "../../utils/localStorageClient";
import { UserOffsets } from "./useUserOffests";
import { localStorageOffsetsValidator } from "./useUserOffests.validator";

const OFFSETS_LOCAL_STORAGE_KEY_PREFIX = "offsets_";
const getStorageKey = (raceId: string) => `${OFFSETS_LOCAL_STORAGE_KEY_PREFIX}${raceId}`;

export const getInitialOffsets = (raceId: string | undefined): UserOffsets | null => {
  if (raceId == null) {
    return null;
  }

  const storageKey = getStorageKey(raceId);
  const localStorageClient = new LocalStorageClient(storageKey, localStorageOffsetsValidator, null);
  const layoutFromStorage = localStorageClient.get();

  return layoutFromStorage;
};

export const saveOffsets = (raceId: string | undefined, offsets: UserOffsets) => {
  if (raceId == null) {
    return;
  }

  const storageKey = getStorageKey(raceId);
  const localStorageClient = new LocalStorageClient(storageKey, localStorageOffsetsValidator, null);

  localStorageClient.set(offsets);
};
