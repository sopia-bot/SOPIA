const typescript = require('rollup-plugin-typescript2');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const fs = require('fs');



module.exports = [
	{
		input: './src/preload/index.ts',
		output: {
			file: './dist/preload.js',
			format: 'cjs',
		},
		external: ['electron'],
		plugins: [
			commonjs({
				include: './node_modules/**',
				namedExports: {
					'electron': ['app']
				}
			}),
			typescript({
				exclude: 'node_modules/**',
			}),
			resolve(),
		],
	},
	{
		input: './src/renderer/index.ts',
		output: {
			file: './dist/renderer.js',
			format: 'esm',
		},
		external: ['electron', 'crypto-js'],
		plugins: [
			{
				name: 'rm',
				buildStart() {
					if ( fs.existsSync('./types') ) {
						fs.rmSync('./types', {
							recursive: true,
						});
					}
				},
			},
			typescript({
        exclude: 'node_modules/**',
				tsconfig: 'tsconfig.renderer.json',
				useTsconfigDeclarationDir: true,
      }),
			resolve(),
		],
	},
  {
		input: './src/entities/index.ts',
		output: {
			file: './dist/entities.js',
			format: 'cjs',
		},
		external: ['electron'],
		plugins: [
			typescript({
        exclude: 'node_modules/**',
      }),
			resolve(),
		],
	},
  {
		input: './src/dto/index.ts',
		output: {
			file: './dist/dto.js',
			format: 'cjs',
		},
		external: ['electron'],
		plugins: [
			typescript({
        exclude: 'node_modules/**',
      }),
			resolve(),
		],
	},
]