/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_IS_PREMIUM: string
    readonly VITE_APP_NAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Globalne sta³e z vite.config define
declare const __IS_PREMIUM__: boolean
declare const __APP_NAME__: string