import del from 'rollup-plugin-delete';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: ['background.ts', 'content.ts'],
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      del({ targets: 'dist/*' }),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve(),
      commonjs(),
      copy({
        targets: [
          { src: 'manifest.json', dest: 'dist' },
          { src: 'images', dest: 'dist' },
        ],
        hook: 'writeBundle',
      }),
    ],
  },
  {
    input: 'popup/index.ts',
    output: {
      dir: 'dist/popup',
      format: 'iife',
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve(),
      commonjs(),
      copy({
        targets: [
          { src: 'popup/index.html', dest: 'dist/popup' },
          { src: 'popup/index.css', dest: 'dist/popup' },
        ],
        hook: 'writeBundle', // Run copy after bundle has been written
      }),
    ],
  },
];
