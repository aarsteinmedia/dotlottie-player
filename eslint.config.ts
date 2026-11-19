import {
  fixupPluginRules, fixupConfigRules,
  type FixupConfig,
  type FixupPluginDefinition
} from '@eslint/compat'
import eslintJs from '@eslint/js'
import preferEarlyReturn from '@regru/eslint-plugin-prefer-early-return'
import stylistic from '@stylistic/eslint-plugin'
import vitest from '@vitest/eslint-plugin'
import createNoRestrictedProperties from 'eslint-no-restricted/properties'
import createNoRestrictedSyntax from 'eslint-no-restricted/syntax'
import fsecond from 'eslint-plugin-fsecond'
import { importX } from 'eslint-plugin-import-x'
import { configs as jsdocConfigs } from 'eslint-plugin-jsdoc'
import perfectionist from 'eslint-plugin-perfectionist'
import regexp from 'eslint-plugin-regexp'
import sonarjs, { configs as sonarConfigs } from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configs as tsConfigs, parser } from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  noRestrictedSyntax = createNoRestrictedSyntax(
    {
      message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      name: 'noLabels',
      selector: 'LabeledStatement'
    },
    {
      message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      name: 'noForInLoops',
      selector: 'ForInStatement'
    },
    {
      message: 'Avoid the Reflect API. It is a very low-level feature that has only rare and specific use-cases if building complex and hacky libraries. There is no need to use this feature for any kind of normal development.',
      name: 'noReflect',
      selector: 'Identifier[name=\'Reflect\']'
    },
    {
      message: 'Avoid Proxy.',
      name: 'noProxy',
      selector: 'Identifier[name=\'Proxy\']'
    },
    {
      message: 'Avoid access modifiers. In Javascript modules there is no need to limit developer access to properties.',
      name: 'noAccessModifiers',
      selector: [
        'PropertyDefinition[accessibility=\'public\']',
        'PropertyDefinition[accessibility=\'protected\']',
        'PropertyDefinition[accessibility=\'private\']'
      ]
    },
    {
      message: 'Avoid PropTypes. Use Typescript instead.',
      name: 'noPropTypes',
      selector: ['Identifier[name=\'PropTypes\']', 'Identifier[name=\'propTypes\']']
    },
    {
      message: 'Avoid the "delete" operator. Use omit() instead.',
      name: 'noDeleteOperator',
      selector: 'UnaryExpression[operator=\'delete\']'
    },
    {
      message: 'Avoid enums.',
      name: 'noEnums',
      selector: 'TSEnumDeclaration'
    },
    {
      message: 'Avoid classes. Use functions and objects instead.',
      name: 'noClasses',
      selector: ['ClassDeclaration', 'ClassExpression']
    }
  ),
  noRestrictedProperties = createNoRestrictedProperties({
    message: 'Please use Number.isFinite instead',
    name: 'isFinite',
    property: [
      {
        object: 'global',
        property: 'isFinite'
      },
      {
        object: 'self',
        property: 'isFinite'
      },
      {
        object: 'window',
        property: 'isFinite'
      }
    ]
  }, {
    message: 'Please use Number.isNaN instead',
    name: 'isNaN',
    property: [
      {
        object: 'global',
        property: 'isNaN'
      },
      {
        object: 'self',
        property: 'isNaN'
      },
      {
        object: 'window',
        property: 'isNaN'
      }
    ]
  }),

  ignores = [
    '**/node_modules/*',
    '**/types/*',
    'tsconfig.json',
  ]

export default defineConfig({
  extends: [
    fixupConfigRules(noRestrictedSyntax.configs.recommended as FixupConfig),
    fixupConfigRules(noRestrictedProperties.configs.recommended as FixupConfig),
    eslintJs.configs.recommended,
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    tsConfigs.strictTypeChecked,
    stylistic.configs.recommended,
    jsdocConfigs['flat/recommended']
  ],
  files: ['**/*.{ts,js}'],
  ignores,
  languageOptions: {
    ecmaVersion: 2024,
    globals: {
      ...globals.node,
      ...globals.browser
    },
    parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname
    }
  },
  plugins: {
    '@regru/prefer-early-return': preferEarlyReturn,
    'fsecond': fixupPluginRules(fsecond as unknown as FixupPluginDefinition),
    'import-x': importX,
    perfectionist,
    regexp,
    sonarjs,
    unicorn,
    vitest
  },

  rules: {
    ...sonarConfigs.recommended.rules,
    '@regru/prefer-early-return/prefer-early-return': [2, { maximumStatements: 1 }],
    '@stylistic/array-bracket-newline': [1, { minItems: 3 }],
    '@stylistic/array-element-newline': [1, { minItems: 3 }],
    '@stylistic/comma-dangle': [1, 'only-multiline'],
    '@stylistic/comma-spacing': 1,
    '@stylistic/curly-newline': 1,
    '@stylistic/function-call-spacing': 1,
    '@stylistic/function-paren-newline': [1, { minItems: 3 }],
    '@stylistic/indent': [1, 2],
    '@stylistic/indent-binary-ops': [1, 2],
    '@stylistic/key-spacing': 1,
    '@stylistic/linebreak-style': 1,
    '@stylistic/lines-between-class-members': [1, {
      enforce: [{
        blankLine: 'always',
        next: 'method',
        prev: 'method'
      }]
    }],
    '@stylistic/no-extra-parens': 1,
    '@stylistic/no-multi-spaces': 1,
    '@stylistic/no-multiple-empty-lines': 1,
    '@stylistic/no-trailing-spaces': 1,
    '@stylistic/object-curly-newline': [1, {
      minProperties: 3,
      multiline: true
    }],
    '@stylistic/object-curly-spacing': [1, 'always'],
    '@stylistic/object-property-newline': 1,
    '@stylistic/padding-line-between-statements': [
      2,
      {
        blankLine: 'always',
        next: '*',
        prev: ['const', 'let']
      },
      {
        blankLine: 'any',
        next: ['const', 'let'],
        prev: ['const', 'let']
      },
      {
        blankLine: 'always',
        next: 'return',
        prev: '*'
      }
    ],
    '@stylistic/quotes': [1, 'single'],
    '@stylistic/semi': [1, 'never'],
    '@stylistic/space-before-blocks': 1,
    '@stylistic/space-in-parens': 1,
    '@stylistic/type-annotation-spacing': 1,
    '@typescript-eslint/array-type': 2,
    '@typescript-eslint/ban-ts-comment': [2, {
      'ts-check': false,
      'ts-expect-error': false,
      'ts-ignore': true,
      'ts-nocheck': false
    }],
    '@typescript-eslint/consistent-type-assertions': 2,
    '@typescript-eslint/consistent-type-definitions': 2,
    '@typescript-eslint/consistent-type-exports': [2, { fixMixedExportsWithInlineTypeSpecifier: true }],
    '@typescript-eslint/consistent-type-imports': [2, { fixStyle: 'inline-type-imports' }],
    '@typescript-eslint/default-param-last': 2,
    '@typescript-eslint/dot-notation': 2,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/method-signature-style': 2,
    '@typescript-eslint/naming-convention': [
      2,
      {
        format: [
          'camelCase',
          'UPPER_CASE',
          'PascalCase',
          'snake_case'
        ],
        leadingUnderscore: 'allowSingleOrDouble',
        selector: 'default',
        trailingUnderscore: 'forbid',
      },
      {
        format: [
          'camelCase',
          'UPPER_CASE',
          'snake_case'
        ],
        leadingUnderscore: 'allowSingleOrDouble',
        modifiers: ['const'],
        selector: 'variable',
        trailingUnderscore: 'forbid',
        types: ['string', 'number'],
      },
      {
        format: null,
        leadingUnderscore: 'allowSingleOrDouble',
        selector: 'objectLiteralProperty',
        trailingUnderscore: 'forbid',
      },
      {
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        selector: 'typeLike',
        trailingUnderscore: 'forbid',
      },
      {
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        selector: 'enum',
        trailingUnderscore: 'forbid',
      },
      {
        custom: {
          match: true,
          // A bug in NodeJS bug causes ?i: to trigger memory threshold
          regex: '^(is|IS|in|IN|has|HAS|can|CAN|should|SHOULD|was|WAS)'
        },
        format: [
          'camelCase',
          'PascalCase',
          'UPPER_CASE'
        ],
        leadingUnderscore: 'allowSingleOrDouble',
        selector: 'variable',
        trailingUnderscore: 'forbid',
        types: ['boolean'],
      },
      {
        format: null,
        modifiers: ['destructured'],
        selector: 'variable',
      },
      {
        format: null,
        selector: 'typeProperty',
      },
    ],
    '@typescript-eslint/no-array-constructor': 0,
    '@typescript-eslint/no-empty-function': 2,
    '@typescript-eslint/no-empty-object-type': [2, { allowInterfaces: 'with-single-extends' }],
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/no-import-type-side-effects': 2,
    '@typescript-eslint/no-inferrable-types': 2,
    '@typescript-eslint/no-loop-func': 2,
    '@typescript-eslint/no-namespace': [2, { allowDeclarations: true }],
    '@typescript-eslint/no-require-imports': 0,
    '@typescript-eslint/no-shadow': [2, {
      allow: [
        'resolve',
        'reject',
        'done',
        'next',
        'warn',
        'error'
      ],
      hoist: 'all',
      ignoreFunctionTypeParameterNameValueShadow: true,
      ignoreTypeValueShadow: true
    }],
    '@typescript-eslint/no-unnecessary-type-parameters': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-class-instance-assignment': 1,
    '@typescript-eslint/no-unused-expressions': [2, {
      allowShortCircuit: true,
      allowTaggedTemplates: true,
      allowTernary: true,
      enforceForJSX: true
    }],
    '@typescript-eslint/no-unused-private-class-members': 2,
    '@typescript-eslint/no-unused-vars': [2, {
      argsIgnorePattern: '^_',
      caughtErrors: 'none',
      caughtErrorsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-use-before-define': [2, {
      classes: false,
      functions: false
    }],
    '@typescript-eslint/prefer-function-type': 2,
    '@typescript-eslint/prefer-nullish-coalescing': [2, { ignorePrimitives: true }],
    '@typescript-eslint/prefer-optional-chain': 2,
    '@typescript-eslint/prefer-string-starts-ends-with': 2,
    '@typescript-eslint/restrict-template-expressions': [2, { allowNumber: true }],
    '@typescript-eslint/switch-exhaustiveness-check': [2, { considerDefaultExhaustiveForUnions: true }],
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 0,
    'arrow-return-style/arrow-return-style': 0,
    'fsecond/no-inline-interfaces': 2,
    'fsecond/prefer-destructured-optionals': 0,
    'func-style': 0,
    'import-x/first': 2,
    'import-x/newline-after-import': 2,
    'import-x/no-anonymous-default-export': 2,
    'import-x/no-default-export': 1,
    'import-x/no-duplicates': [2, { 'prefer-inline': true }],
    'import-x/no-named-as-default': 2,
    'import-x/no-useless-path-segments': [2, { noUselessIndex: true }],
    'jsdoc/require-jsdoc': 0,
    'jsdoc/require-param': 0,
    'jsdoc/require-param-type': 0,
    'jsdoc/require-returns': 0,
    'jsdoc/require-returns-type': 0,
    'no-console': [2, {
      allow: [
        'error',
        'warn',
        'info'
      ]
    }],
    'no-plusplus': 0,
    'no-restricted-globals': [
      2,
      'event',
      'fdescribe'
    ],
    'no-restricted-syntax/noAccessModifiers': 0,
    'no-restricted-syntax/noClasses': 0,
    'no-restricted-syntax/noEnums': 0,
    'no-void': 0,
    'operator-assignment': 0,
    'perfectionist/sort-classes': 1,
    'perfectionist/sort-enums': 1,
    'perfectionist/sort-imports': 1,
    'perfectionist/sort-interfaces': 1,
    'perfectionist/sort-objects': 1,
    'simple-import-sort/imports': 0,
    'sonarjs/cognitive-complexity': 'warn',
    'sonarjs/different-types-comparison': 'off',
    'sonarjs/function-return-type': 'warn',
    'sonarjs/no-invariant-returns': 'warn',
    'sonarjs/no-unused-vars': 0,
    'sonarjs/todo-tag': 1,
    'unicorn/catch-error-name': 2,
    'unicorn/consistent-date-clone': 2,
    'unicorn/consistent-destructuring': 2,
    'unicorn/consistent-empty-array-spread': 2,
    'unicorn/consistent-function-scoping': 2,
    'unicorn/error-message': 2,
    'unicorn/explicit-length-check': 2,
    'unicorn/no-array-push-push': 2,
    'unicorn/no-array-reduce': [2, { allowSimpleOperations: true }],
    'unicorn/no-array-reverse': 2,
    'unicorn/no-array-sort': 2,
    'unicorn/no-await-expression-member': 2,
    'unicorn/no-await-in-promise-methods': 2,
    'unicorn/no-for-loop': 0,
    'unicorn/no-immediate-mutation': 2,
    'unicorn/no-instanceof-array': 2,
    'unicorn/no-invalid-file-input-accept': 2,
    'unicorn/no-new-array': 2,
    'unicorn/no-new-buffer': 2,
    'unicorn/no-single-promise-in-promise-methods': 2,
    'unicorn/no-unnecessary-nested-ternary': 2,
    'unicorn/no-unused-properties': 2,
    'unicorn/no-useless-fallback-in-spread': 2,
    'unicorn/no-useless-length-check': 2,
    'unicorn/no-useless-spread': 2,
    'unicorn/prefer-array-find': 2,
    'unicorn/prefer-array-flat': 2,
    'unicorn/prefer-array-flat-map': 2,
    'unicorn/prefer-array-index-of': 2,
    'unicorn/prefer-array-last-methods': 2,
    'unicorn/prefer-array-some': 2,
    'unicorn/prefer-date-now': 2,
    'unicorn/prefer-default-parameters': 2,
    'unicorn/prefer-event-target': 2,
    'unicorn/prefer-export-from': [2, { checkUsedVariables: false }],
    'unicorn/prefer-includes': 2,
    'unicorn/prefer-includes-over-repeated-comparisons': 2,
    'unicorn/prefer-logical-operator-over-ternary': 2,
    'unicorn/prefer-native-coercion-functions': 2,
    'unicorn/prefer-node-protocol': 2,
    'unicorn/prefer-object-from-entries': 2,
    'unicorn/prefer-prototype-methods': 2,
    'unicorn/prefer-query-selector': 0,
    'unicorn/prefer-response-static-json': 2,
    'unicorn/prefer-set-size': 2,
    'unicorn/prefer-spread': 2,
    'unicorn/prefer-string-replace-all': 2,
    'unicorn/prefer-string-slice': 2,
    'unicorn/prefer-switch': [2, { emptyDefaultCase: 'do-nothing-comment' }],
    'unicorn/prefer-top-level-await': 2,
    'unicorn/prefer-type-error': 2,
    'unicorn/require-passive-events': 2,
    'unicorn/switch-case-braces': 2,
    'unicorn/template-indent': 1,
    'unicorn/throw-new-error': 2
  },
},
{
  files: [
    '**/*.config.ts',
    'src/*.ts',
    '**/*.d.ts'
  ],
  rules: { 'import-x/no-default-export': 0 }
})
