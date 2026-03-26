export type AppMode = 'mock' | 'sandbox' | 'production'

export const APP_MODE = (process.env.NEXT_PUBLIC_APP_ENV ?? 'mock') as AppMode
export const IS_MOCK = APP_MODE === 'mock'
export const IS_SANDBOX = APP_MODE === 'sandbox'
