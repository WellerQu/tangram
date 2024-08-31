import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import pkg from './package.json' with { type: 'json' }

const dependencies = Object.keys(pkg.dependencies)

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    assetFileNames: '[name][extname]',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ resolveOnly: dependencies }),
    commonjs(),
    typescript(),
  ],
}
