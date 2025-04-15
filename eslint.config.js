/* eslint-disable global-require */

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...require('@js-toolkit/configs/eslint/common'),
  ...require('@js-toolkit/configs/eslint/web'),
  ...require('@js-toolkit/react-hooks/eslint'),

  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
];
