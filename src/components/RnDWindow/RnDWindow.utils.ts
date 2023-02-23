import { assertNever } from "../../utils/assertNever";

export const formatPercentToString = (value: number) => {
  return `${value}%`;
};

export const sizePercentToPx = (value: number, referenceValue: number) => {
  return (value / 100) * referenceValue;
};

export const sizePxToPercent = (value: number, referenceValue: number) => {
  return (value / referenceValue) * 100;
};

const getRoundToNearestFunction = (roundLogic: "down" | "nearest" | "up") => {
  if (roundLogic === "up") {
    return Math.ceil;
  }

  if (roundLogic === "nearest") {
    return Math.round;
  }

  if (roundLogic === "down") {
    return Math.floor;
  }

  return assertNever(roundLogic);
};
export const roundToNearest = (
  value: number,
  roundingStep: number,
  roundLogic: "down" | "nearest" | "up" = "nearest",
) => {
  const roundToNearestFunction = getRoundToNearestFunction(roundLogic);

  return roundToNearestFunction(value / roundingStep) * roundingStep;
};
