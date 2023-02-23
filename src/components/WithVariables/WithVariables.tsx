import React from "react";

type Variables = Record<string, string | number>;
type BaseProps = JSX.IntrinsicElements["div"];
export interface WithVariableProps extends BaseProps {
  as?: React.ElementType | undefined;
  variables?: Variables;
}

export function WithVariables({ as: Component = "div", style = {}, variables = {}, ...props }: WithVariableProps) {
  return <Component style={getStylesWithVariables(variables, style)} {...props} />;
}

export const getStylesWithVariables = (variables: Variables, style: React.CSSProperties = {}) => {
  const variablesAsStyles = Object.fromEntries(Object.entries(variables).map(([key, value]) => [`--${key}`, value]));

  return {
    ...style,
    ...variablesAsStyles,
  } as React.CSSProperties;
};
