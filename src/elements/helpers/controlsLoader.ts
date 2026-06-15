type ControlsModule = typeof import('@/templates/controls')

let modulePromise: Promise<ControlsModule> | null

export function loadControlsModule() {
  modulePromise = modulePromise ?? import('@/templates/controls')

  return modulePromise
}

export type RenderControls = ControlsModule['default']