type ErrorModule = typeof import('@/templates/errorScreen')

let modulePromise: Promise<ErrorModule> | null = null

export function loadErrorModule() {
  modulePromise = modulePromise ?? import('@/templates/errorScreen')

  return modulePromise
}