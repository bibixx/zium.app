import type { TimingResponse, TimingRoot } from "../useTimingData.validator";

interface StateCacheEntry {
  key: number;
  value: TimingRoot | null;
  index: number;
}

const MAX_STATE_CACHE_SIZE = 100;
class StateCache {
  public stateCache: Map<number, StateCacheEntry> = new Map();
  public stateStack: number[] = [];

  private limitStateCacheSize() {
    if (this.stateStack.length <= MAX_STATE_CACHE_SIZE) {
      return;
    }

    const deletedKeys = this.stateStack.splice(0, this.stateStack.length - MAX_STATE_CACHE_SIZE);

    for (const key of deletedKeys) {
      this.stateCache.delete(key);
    }
  }

  private pushKeyToEnd(key: number) {
    const currentIndex = this.stateCache.get(key)?.index;

    if (currentIndex != null) {
      this.stateStack.splice(currentIndex, 1);
    }

    this.stateStack.push(key);

    return this.stateStack.length - 1;
  }

  public set(key: number, value: TimingRoot | null) {
    const index = this.pushKeyToEnd(key);

    this.stateStack.push(key);
    this.stateCache.set(key, { value, key, index });

    this.limitStateCacheSize();
  }

  public get(key: number) {
    const entry = this.stateCache.get(key);
    if (entry) {
      entry.index = this.pushKeyToEnd(key);

      this.stateCache.set(key, entry);
    }

    return this.stateCache.get(key)?.value;
  }
}

class DataStore {
  public data!: TimingResponse[];
  public stateCache!: StateCache;

  public init() {
    this.data = [];
    this.stateCache = new StateCache();
  }
}

export const dataStore = new DataStore();
