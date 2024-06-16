import { ContractHandler } from "../../../../types/Contract";
import { PageToWorkerContract } from "../timingData.contract";
import { dataStore } from "../timingData.store";
import { getDataRange } from "../timingData.utils";

export const getDataRangeHandler: ContractHandler<PageToWorkerContract["getDataRange"]> = () => {
  return getDataRange(dataStore.data);
};
