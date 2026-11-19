import type * as Controls from '@/templates/controls'

type ControlsModule = typeof Controls

let modulePromise: Promise<ControlsModule> | null

export function loadControlsModule() {
  modulePromise = modulePromise ?? import('@/templates/controls')

  return modulePromise
}

export type RenderControls = ControlsModule['renderControls']
