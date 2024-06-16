import { ContractHandler } from "../../../../types/Contract";
import { EmptyTimingResponse, isMessageTimingResponse, parseTimingData } from "../../useTimingData.validator";
import { PageToWorkerContract } from "../timingData.contract";
import { dataStore } from "../timingData.store";
import { getDataRange } from "../timingData.utils";

export const pushDataLineHandler: ContractHandler<PageToWorkerContract["pushDataLine"]> = (timingResponses) => {
  for (const timingResponse of [timingResponses]) {
    const r = parseTimingData(timingResponse);

    if (!r.success) {
      continue;
    }

    const isEmpty = EmptyTimingResponse.safeParse(r.data);

    if (isEmpty.success) {
      continue;
    }

    if (isMessageTimingResponse(r.data) && r.data.M.length === 0) {
      continue;
    }

    dataStore.data.push(r.data);
  }

  return getDataRange(dataStore.data);
};
