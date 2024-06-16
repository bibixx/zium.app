import { Contract, ReverseContractMap } from "../../../types/Contract";
import { TimingRoot } from "../useTimingData.validator";

type PageToWorkerContractBase = {
  getData: Contract<number, TimingRoot | null>;
  getDataRange: Contract<undefined, DataRange | null>;
  pushDataLine: Contract<unknown, DataRange | null>;
  setupSocketConnection: Contract<undefined, void>;
};
type WorkerToPageContractBase = {
  pushDataRange: Contract<DataRange, void>;
};

type DataRange = { start: number; end: number };
export type PageToWorkerContract = PageToWorkerContractBase & ReverseContractMap<WorkerToPageContractBase>;
export type WorkerToPageContract = WorkerToPageContractBase & ReverseContractMap<PageToWorkerContractBase>;
