import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/client/index.tsx',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        name: 'react-lib',
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: [/^antd[.]*/, /^antv[.]*/, /\.css$/, /\.less$/],
    plugins: [
      external([/^antd[.]*/, /^antv[.]*/]),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less'],
        preferBuiltins: true,
      }),
      babel({
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
        babelrc: false,
        plugins: [
          ['import', { libraryName: 'antd', style: true }, 'antd'],
          ['import', { libraryName: 'antv', style: true }, 'antv'],
          '@babel/proposal-class-properties',
          '@babel/proposal-object-rest-spread',
          'const-enum',
          '@babel/plugin-transform-typescript',
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        exclude: [/\**node_modules\**/, /\**.spec.tsx\**/],
        babelHelpers: 'bundled',
      }),
      commonjs(),
      json(),
      typescript({
        exclude: [
          '*.d.ts',
          '**/*.d.ts',
          '**/*.story.tsx',
          '**/*.spec.tsx',
          '**/node_modules/**/*',
          'node_modules/**/*',
          '*.spec.tsx',
        ],
        tsconfig: './tsconfig.rollup.json',
        include: ['./custom/d.ts'],
      }),
      postcss({
        extensions: ['.css', '.scss', '.less'],
        use: [['less', { javascriptEnabled: true }], 'sass', 'css'],
      }),
      terser(),
    ],
  },
  {
    input: 'searchdist/esm/index.d.ts',
    output: [{ file: 'searchdist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts.default()],
  },
];
