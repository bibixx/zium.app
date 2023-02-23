export const formatPercentToString = (value: number) => {
  return `${value}%`;
};

export const sizePercentToPx = (value: number, referenceValue: number) => {
  return (value / 100) * referenceValue;
};

export const sizePxToPercent = (value: number, referenceValue: number) => {
  return (value / referenceValue) * 100;
};

export const roundToNearest = (value: number, roundingStep: number) => {
  return Math.round(value / roundingStep) * roundingStep;
};
