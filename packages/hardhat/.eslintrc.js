module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },

  root: true,

  plugins: [
    '@typescript-eslint',
    'json',
    'promise',
    'prefer-arrow',
    'import',
    'unused-imports',
    'simple-import-sort',
    'sonarjs',
    'prettier',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended',
    'plugin:json/recommended',
    'plugin:promise/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:sonarjs/recommended',
    'prettier',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 12,
  },

  rules: {
    'prettier/prettier': 'warn',
    /* Import rules */
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-vars': ['warn', { ignoreCase: true }],
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] },
    ],
    'import/no-restricted-paths': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    /* SonarJs rules */
    'sonarjs/no-duplicate-string': 1,
    'sonarjs/cognitive-complexity': 1,
    'sonarjs/no-nested-template-literals': 0,
    'import/extensions': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['./'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['dist', '**/*.d.ts'],
}
