import { ReactNode, useMemo } from "react";
import { useFeatureFlags } from "./useFeatureFlags";
import { toKebabCase } from "./useFeatureFlags.utils";

interface FeatureFlagsWrapperProps {
  children: ReactNode;
}
export const FeatureFlagsWrapper = ({ children }: FeatureFlagsWrapperProps) => {
  const featureFlagsState = useFeatureFlags();
  const dataAttributes = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(featureFlagsState.flags).map(([key, value]) => [`data-ff-${toKebabCase(key)}`, value]),
      ),
    [featureFlagsState.flags],
  );

  return <div {...dataAttributes}>{children}</div>;
};
