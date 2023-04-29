import { useCallback, useEffect, useMemo, useState } from "react";

export const useLaggedBehindData = <T>(outsideData: T, isUpToDate: boolean) => {
  const [laggedBehindData, setLaggedBehindData] = useState(outsideData);
  useEffect(() => {
    if (isUpToDate) {
      setLaggedBehindData(outsideData);
    }
  }, [outsideData, isUpToDate]);

  const reset = useCallback(() => setLaggedBehindData(outsideData), [outsideData]);

  const data = useMemo(
    () => (isUpToDate ? outsideData : laggedBehindData),
    [isUpToDate, laggedBehindData, outsideData],
  );

  return { data, reset };
};
