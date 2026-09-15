declare module '*.css' {
  const content: string

  export default content
}

declare module 'stylelint-config-recommended' {
  import type { Config } from 'stylelint'

  const config: Config

  export default config
}

declare module '@regru/eslint-plugin-prefer-early-return' {
  import type { RuleDefinition } from '@eslint/core'

  const rules: Record<string, RuleDefinition>

  export { rules }
}