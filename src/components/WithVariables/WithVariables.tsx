import React, { forwardRef } from "react";

type Variables = Record<string, string | number | undefined>;
type BaseProps = JSX.IntrinsicElements["div"];
export interface WithVariableProps extends BaseProps {
  as?: React.ElementType | undefined;
  variables?: Variables;
}

export const WithVariables = forwardRef<HTMLDivElement, WithVariableProps>(
  ({ as: Component = "div", style = {}, variables = {}, ...props }, ref) => {
    return <Component ref={ref} style={getStylesWithVariables(variables, style)} {...props} />;
  },
);

export const getStylesWithVariables = (variables: Variables, style: React.CSSProperties = {}) => {
  const variablesAsStyles = Object.fromEntries(
    Object.entries(variables)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [`--${key}`, value]),
  );

  return {
    ...style,
    ...variablesAsStyles,
  } as React.CSSProperties;
};
