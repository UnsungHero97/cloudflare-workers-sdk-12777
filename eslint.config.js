import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/* eslint-disable @stylistic/max-len */

export default tseslint.config(
  {
    ignores: [
      '**/build/',
      '**/coverage/',
      '**/dist/',
      '**/ignore/',
      '**/node_modules/',
    ],
  },
  eslint.configs.recommended,
  stylistic.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  hooks.configs.flat.recommended,
  react.configs.flat['all'] ?? {},
  react.configs.flat['jsx-runtime'] ?? {},
  {
    rules: {
      'react/forbid-component-props': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
      'react/jsx-handler-names': 'off',
      'react/jsx-max-depth': ['warn', { max: 8 }],
      'react/jsx-no-bind': 'warn',
      'react/no-multi-comp': 'off',
      'react/prefer-read-only-props': 'off',
      'react/require-default-props': ['warn', { functions: 'defaultArguments' }],

      // @stylistic/eslint-plugin implements these rules
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-max-props-per-line': 'off',
      'react/jsx-newline': 'off',
      'react/jsx-no-literals': 'off',
      'react/jsx-one-expression-per-line': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // eslint rules
      'consistent-return': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'error',
      'sort-keys': ['error', 'asc', { allowLineSeparatedGroups: true, natural: true }],

      // @stylistic rules
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/key-spacing': 'off', // https://github.com/eslint-stylistic/eslint-stylistic/issues/476
      '@stylistic/max-len': ['error', { code: 120 }],
      '@stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'semi', requireLast: true }, singleline: { delimiter: 'semi', requireLast: false } }],
      '@stylistic/operator-linebreak': ['warn', 'before', { overrides: { '=': 'after' } }],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/type-annotation-spacing': ['error', { overrides: { colon: { after: false, before: true } } }],

      // @typescript-eslint rules
      '@typescript-eslint/adjacent-overload-signatures': 'off',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-check': false, 'ts-expect-error': 'allow-with-description', 'ts-ignore': true, 'ts-nocheck': true }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
    }
  },
);
