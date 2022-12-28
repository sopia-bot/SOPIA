const typescript = require('rollup-plugin-typescript2');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');

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
			typescript(),
			resolve(),
		],
	},
]