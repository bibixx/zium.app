/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_DOMAINS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
