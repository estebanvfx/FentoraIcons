const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const { dts } = require('rollup-plugin-dts');
const terser = require('@rollup/plugin-terser');

const packageName = 'LineIconsReact';
const outputFileName = 'index';

const external = ['react', 'react/jsx-runtime'];

const plugins = (minify = false, outDir = 'dist') => [
  resolve(),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['**/*.test.ts', '**/*.test.tsx'],
    outDir,
    declaration: false,
    declarationMap: false,
  }),
  ...(minify ? [terser()] : [])
];

module.exports = [
  // CommonJS Bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: plugins(false, 'dist/cjs'),
    external
  },

  // ES Module Bundle
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: plugins(false, 'dist/esm'),
    external
  },

  // UMD Bundle (development)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/index.js',
      format: 'umd',
      name: packageName,
      sourcemap: true,
      globals: {
        react: 'React',
        'react/jsx-runtime': 'jsxRuntime'
      }
    },
    plugins: plugins(false, 'dist/umd'),
    external
  },

  // UMD Bundle (minified)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/index.min.js',
      format: 'umd',
      name: packageName,
      sourcemap: true,
      globals: {
        react: 'React',
        'react/jsx-runtime': 'jsxRuntime'
      }
    },
    plugins: plugins(true, 'dist/umd'),
    external
  },
  
  // TypeScript Definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];