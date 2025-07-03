/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENCAGE_API_KEY: string;
  readonly VITE_WEATHER_API_KEY: string;
  // add any other VITE_ vars here…
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
