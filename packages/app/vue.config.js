const path = require('path');
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				publish: [
					{
						"provider": "s3",
						"bucket": "sopia-v3",
						"region": "ap-northeast-2",
					},
				],
				linux: {
					"executableName": "sopia-v3",
					"artifactName": "${productName}-${version}.${ext}"
				},
				productName: 'SOPIAv3',
			},
			nodeModulesPath: ['../../node_modules', './node_modules']
		},
	},
	configureWebpack: {
		resolve: {
			alias: {
				"assets": path.join(__dirname, "src/assets"),
				"@": path.join(__dirname, "src"),
			},
		},
		module: {
			exprContextCritical: false,
		},
		plugins: [
			new MonacoEditorPlugin({
				// https://github.com/Microsoft/monaco-editor-webpack-plugin#options
				// Include a subset of languages support
				// Some language extensions like typescript are so huge that may impact build performance
				// e.g. Build full languages support with webpack 4.0 takes over 80 seconds
				// Languages are loaded on demand at runtime
				languages: ['javascript', 'css', 'html', 'typescript', 'json', 'markdown'],
				features: ['!gotoSymbol'],
			}),
		],
	},
	transpileDependencies: [
		"vuetify"
	],
	runtimeCompiler: true,
}
