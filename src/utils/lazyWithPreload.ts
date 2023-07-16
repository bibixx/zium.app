import { ComponentType, lazy } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyWithPreload = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) => {
  const Component = lazy(factory);

  return { Component, preload: factory };
};
