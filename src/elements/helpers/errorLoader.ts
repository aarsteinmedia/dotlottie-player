import type * as ErrorScreen from '@/templates/errorScreen'

type ErrorModule = typeof ErrorScreen

let modulePromise: Promise<ErrorModule> | null = null

export function loadErrorModule() {
  modulePromise = modulePromise ?? import('@/templates/errorScreen')

  return modulePromise
}
