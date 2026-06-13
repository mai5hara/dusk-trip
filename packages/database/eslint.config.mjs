import nodeConfig from '@mood-trip/config/eslint/node.mjs';

export default [
  ...nodeConfig,
  {
    ignores: ['dist/**', 'src/generated/**'],
  },
];
