/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_DOMAINS: string;
  readonly VITE_BITMOVIN_PLAYER_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
