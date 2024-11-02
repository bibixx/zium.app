import { ContractHandler } from "../../../../types/Contract";
import { TimingRoot } from "../../useTimingData.validator";
import { PageToWorkerContract } from "../timingData.contract";
import { dataStore } from "../timingData.store";
import { binarySearch, extractTime, updateState } from "../timingData.utils";

export const getDataHandler = (abortSignal: AbortSignal): ContractHandler<PageToWorkerContract["getData"]> => {
  return async (searchedTime) => {
    const stateCache = dataStore.stateCache;
    const data = dataStore.data;

    const cachedState = stateCache.get(searchedTime);

    if (cachedState != null) {
      return cachedState;
    }

    let endIndex = binarySearch(data, searchedTime);
    let prevState: TimingRoot | null = null;
    let lastKnownStateIndex = -1;
    for (let i = endIndex; i >= 0; i--) {
      const element = data[i];
      const time = extractTime(element);

      if (time == null) {
        continue;
      }

      const cachedState = stateCache.get(time);
      if (cachedState != null) {
        prevState = cachedState;
        lastKnownStateIndex = i;
        break;
      }
    }

    const abortSignalIntervalCheck = setInterval(() => {
      abortSignal.throwIfAborted();
    }, 100);

    if (endIndex === 0 && lastKnownStateIndex === -1) {
      endIndex = 1;
    }

    for (let i = lastKnownStateIndex + 1; i <= endIndex; i++) {
      const response = data[i];
      if (response == null) {
        continue;
      }

      const mergedState = updateState(prevState, response[1]);

      prevState = mergedState;
    }

    clearInterval(abortSignalIntervalCheck);

    const newState = TimingRoot.safeParse(prevState);

    if (!newState.success) {
      console.error("Failed to update state");
      console.error(newState.error.toString());

      return null;
    }

    stateCache.set(extractTime(data[endIndex])!, newState.data);
    return newState.data;
  };
};
