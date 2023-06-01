/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare function structuredClone<T>(value: T, options?: StructuredSerializeOptions): T;

declare module "react" {
  interface DOMAttributes {
    inert?: "" | undefined;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      inert?: "" | undefined;
    }
  }
}

export {};
