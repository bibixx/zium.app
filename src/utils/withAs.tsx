/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useMemo } from "react";

/* eslint-disable react/prop-types */
export function withAs<T extends React.ElementType>(defaultAs: T) {
  return <Props extends object>(
    C: React.ForwardRefRenderFunction<
      React.ElementRef<T>,
      Props & { as: React.ElementType } & Omit<React.ComponentPropsWithoutRef<T>, keyof Props>
    >,
  ): (<U extends React.ElementType = T>(
    props: Omit<Props, "as"> &
      Omit<React.ComponentPropsWithoutRef<U>, keyof Props> & { as?: U } & React.RefAttributes<React.ElementRef<U>>,
  ) => React.ReactNode) => {
    return forwardRef<any, any>(({ as, ...props }, ref) => {
      const Component = useMemo(() => forwardRef(C) as React.FC<any>, []);
      return <Component {...props} as={as ?? defaultAs} ref={ref} />;
    });
  };
}
