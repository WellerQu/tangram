import typescript from '@rollup/plugin-typescript'
// import { nodeResolve } from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'

import css from 'rollup-plugin-css-only'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    assetFileNames: '[name][extname]',
    sourcemap: true,
  },
  external: ['react', 'react/jsx-runtime'],
  plugins: [
    css({ output: 'tangram.css' }),
    typescript(),
  ],
}
