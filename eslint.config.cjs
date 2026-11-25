/* eslint-disable global-require */

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...require('@js-toolkit/configs/eslint/common'),
  ...require('@js-toolkit/configs/eslint/web'),
  ...require('@js-toolkit/react-hooks/eslint'),

  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      // The package is ESM: relative imports need the `.js` extension.
      'import-x/extensions': ['error', 'ignorePackages'],
      // The global types are a script shared by the ESM and CommonJS declarations.
      '@typescript-eslint/triple-slash-reference': ['error', { path: 'always' }],
    },
  },
];
