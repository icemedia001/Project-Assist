import next from 'eslint-config-next'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'src/generated/**',
    ],
  },
  {
    ...next,
    rules: {
      ...next.rules,
    },
  },
  {
    files: ['src/generated/prisma/wasm.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
 
