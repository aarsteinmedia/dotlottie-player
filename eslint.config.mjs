import TSESlint from 'typescript-eslint'
import _import from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import perfectionist from 'eslint-plugin-perfectionist'
import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'
import ESLint from '@eslint/js'
import ESLintConfigPrettier from 'eslint-config-prettier'
import ESLintPluginPrettier from 'eslint-plugin-prettier'

export default TSESlint.config(
  {
    ignores: ['**/node_modules', 'types/**/*', 'dist/**/*', 'dev/**/*'],
  },
  ESLint.configs.recommended,
  ...TSESlint.configs.recommended,
  ESLintConfigPrettier,
  {
    files: ['**/*.{ts,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      // parser: tsParser,
      sourceType: 'module',
    },

    plugins: {
      import: fixupPluginRules(_import),
      jsdoc,
      perfectionist,
      prettier: ESLintPluginPrettier,
    },

    rules: {
      ...ESLintPluginPrettier.configs?.recommended.rules,
      ...ESLintConfigPrettier.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'array-bracket-spacing': 'error',
      'arrow-body-style': ['error', 'as-needed'],

      camelcase: 'warn',

      'computed-property-spacing': ['error', 'never'],
      curly: ['warn', 'all'],

      'dot-notation': [
        'error',
        {
          allowPattern: '^[a-z]+(_[a-z]+)+$',
        },
      ],

      eqeqeq: ['warn', 'always'],

      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true,
        },
      ],
      'import/default': 'error',
      'import/export': 'error',
      'import/first': 'warn',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',
      'import/no-commonjs': 'error',
      'import/no-cycle': 'error',
      'import/no-duplicates': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',

      'import/no-unresolved': 'error',

      'import/no-useless-path-segments': 'error',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'unknown',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'never',
        },
      ],

      'jsdoc/newline-after-description': 0,

      'jsdoc/no-undefined-types': 0,

      'jsdoc/require-jsdoc': [
        'warn',
        {
          exemptEmptyFunctions: true,
        },
      ],

      'jsdoc/require-param-description': 0,
      'jsdoc/require-property-description': 0,
      'jsdoc/require-returns-description': 0,
      'max-depth': ['error', 4],
      'new-parens': ['error', 'always'],
      'no-confusing-arrow': [
        'error',
        {
          allowParens: true,
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['error', 'warn', 'info'],
        },
      ],
      'no-constant-condition': [
        'error',
        {
          checkLoops: false,
        },
      ],
      'no-else-return': 'error',
      'no-floating-decimal': 'error',

      'no-lonely-if': 'error',

      'no-mixed-operators': [
        'error',
        {
          allowSamePrecedence: true,

          groups: [
            ['&', '|', '^', '~', '<<', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
        },
      ],

      'no-multi-assign': 'error',
      'no-multi-spaces': 'warn',

      'no-negated-condition': 'error',

      'no-nested-ternary': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-return-await': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',

      'no-void': 'error',

      'no-with': 'error',
      'one-var-declaration-per-line': 'error',
      'operator-assignment': ['error', 'always'],
      'perfectionist/sort-objects': 'warn',
      'prefer-const': 'error',

      'prefer-object-spread': 'warn',

      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: false,
          avoidEscape: true,
        },
      ],
      semi: ['warn', 'never'],
      'spaced-comment': [
        'warn',
        'always',
        {
          block: {
            balanced: true,
          },

          line: {
            markers: ['#region', '#endregion', 'region', 'endregion'],
          },
        },
      ],
      'wrap-iife': ['error', 'inside'],

      yoda: [
        'error',
        'never',
        {
          exceptRange: true,
        },
      ],
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  }
)
