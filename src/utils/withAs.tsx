/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useMemo } from "react";

/* eslint-disable react/prop-types */
export function withAs<T extends React.ElementType>(defaultAs: T) {
  return <Props extends object>(
    C: React.ForwardRefRenderFunction<
      React.ElementRef<T>,
      React.PropsWithoutRef<Props & { as: React.ElementType } & Omit<React.ComponentPropsWithoutRef<T>, keyof Props>>
    >,
  ): { displayName?: string } & (<U extends React.ElementType = T>(
    props: Omit<Props, "as"> &
      Omit<React.ComponentPropsWithoutRef<U>, keyof Props> & { as?: U } & React.RefAttributes<React.ElementRef<U>>,
  ) => React.ReactNode) => {
    return forwardRef<any, any>(({ as, ...props }, ref) => {
      const Component = useMemo(() => forwardRef(C) as React.FC<any>, []);
      return <Component {...props} as={as ?? defaultAs} ref={ref} />;
    });
  };
}
