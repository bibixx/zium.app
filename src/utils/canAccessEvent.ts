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

  if (currentTier === "Premium") {
    return true;
  }

  if (currentTier === "Unknown") {
    return true;
  }

  if (currentTier === "Access") {
    return currentTier === entitlement;
  }

  return assertNever(currentTier);
};
