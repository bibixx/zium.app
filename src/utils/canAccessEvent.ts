import { RaceEntitlement } from "../constants/races";
import { assertNever } from "./assertNever";
import { F1TVTier } from "./extensionApi";

export const canAccessEvent = (currentTier: F1TVTier, entitlement: RaceEntitlement) => {
  if (currentTier === "None") {
    return false;
  }

  if (currentTier === "Pro") {
    return true;
  }

  if (currentTier !== "Access") {
    return assertNever(currentTier);
  }

  return currentTier === entitlement;
};
