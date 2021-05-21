module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['prettier', 'import'],
  extends: [
    'airbnb-base',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': ['error'],
    'import/no-unresolved': ['off'],
    'no-unused-expressions': ['off'],
    'import/no-cycle': ['off'],
    'import/extensions': [
      0,
      'ignorePackages',
      { json: 'always', js: 'never', ts: 'never' },
    ],
    'import/prefer-default-export': ['off'],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.ts', '**/*.spec.ts', '**/*-spec.ts'] },
    ],
    'no-useless-constructor': ['off'],
    'class-methods-use-this': ['off'],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-expressions': ['error'],
    'no-underscore-dangle': 'off',
    'no-param-reassign': [
      'error',
      { ignorePropertyModificationsFor: ['logger'] },
    ],
    'no-empty-function': ['error', { allow: ['methods', 'constructors'] }],
    'max-classes-per-file': ['error', 10],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
};
