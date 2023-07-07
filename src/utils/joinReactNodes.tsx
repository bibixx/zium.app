import { ReactNode } from "react";

export const joinReactNodes = (nodes: ReactNode[], joinNode: ReactNode) => (
  <>
    {nodes.map((el, i) => (
      <>
        {i > 0 && joinNode}
        {el}
      </>
    ))}
  </>
);
