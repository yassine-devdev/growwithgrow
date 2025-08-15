/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRPC_HTTP_URL: string
  readonly VITE_TRPC_WS_URL: string
  readonly VITE_GOOGLE_GEMINI_API_KEY: string
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}