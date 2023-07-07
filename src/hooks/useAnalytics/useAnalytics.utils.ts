import { z } from "zod";
import { LocalStorageClient } from "../../utils/localStorageClient";

export const wasConsentGivenStorageClient = new LocalStorageClient("wasConsentGiven", z.boolean(), null);

export const setInitialWasConsentGiven = (value: boolean | null) => {
  if (value == null) {
    wasConsentGivenStorageClient.remove();
    return;
  }

  wasConsentGivenStorageClient.set(value);
};
