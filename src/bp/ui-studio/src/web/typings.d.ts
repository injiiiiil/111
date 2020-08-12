import { BPStorage } from '~/util/storage'

// TODO: remove when at least one typing is exported from this file
export interface test {}

declare global {
  interface Window {
    __BP_VISITOR_ID: string
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    botpressWebChat: any
    APP_NAME: string
    APP_VERSION: string
    APP_FAVICON: string
    APP_CUSTOM_CSS: string
    BOT_API_PATH: string
    API_PATH: string

    ROOT_PATH: string
    BOT_NAME: string
    BOT_ID: string
    BP_BASE_PATH: string
    SEND_USAGE_STATS: boolean
    IS_BOT_MOUNTED: boolean
    BOT_LOCKED: boolean
    WORKSPACE_ID: string
    BOTPRESS_FLOW_EDITOR_DISABLED: boolean
    SOCKET_TRANSPORTS: string[]
    ANALYTICS_ID: string
    UUID: string
    BP_STORAGE: BPStorage
    EXPERIMENTAL: boolean
    USE_SESSION_STORAGE: boolean
    USE_ONEFLOW: boolean
    botpress: {
      [moduleName: string]: any
    }
    TELEMETRY_URL: string
    toggleSidePanel: () => void
  }
}

/** Represent prompts and variables including the user's custom elements */
export interface CustomItems {
  /** The base type of the variable or the prompt */
  type: string
  /** Represent the custom type when using a generic type */
  subType?: string
  icon?: any
  /** What is actually displayed on the UI */
  label: string
}
