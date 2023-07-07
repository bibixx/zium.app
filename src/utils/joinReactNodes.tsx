import { Fragment, ReactNode } from "react";

export const joinReactNodes = (nodes: ReactNode[], joinNode: ReactNode) => (
  <>
    {nodes.map((el, i) => (
      <Fragment key={i}>
        {i > 0 && joinNode}
        {el}
      </Fragment>
    ))}
  </>
);
