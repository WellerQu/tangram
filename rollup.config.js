import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

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
    nodeResolve({ resolveOnly: ['classnames'] }),
    commonjs(),
    typescript(),
  ],
}
