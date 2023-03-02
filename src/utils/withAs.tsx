export function withAs<T extends React.ElementType>(defaultAs: T) {
  return <Props extends object>(
    C: (props: Props & { as: React.ElementType } & Omit<React.ComponentPropsWithRef<T>, keyof Props>) => JSX.Element,
  ) => {
    return <U extends React.ElementType = T>({
      as,
      ...props
    }: Omit<Props, "as"> & Omit<React.ComponentPropsWithRef<U>, keyof Props> & { as?: U }) => {
      const Component = C as React.FC<any>;
      return <Component {...props} as={as ?? defaultAs} />;
    };
  };
}
