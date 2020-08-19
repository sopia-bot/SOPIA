const path = require('path');

module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntergration: true,
			nodeModulesPath: ['./node_modules'],
		},
	},
	configureWebpack: {
		resolve: {
			alias: {
				"assets": path.join(__dirname, "src/assets"),
				"@": path.join(__dirname, "src"),
			},
		},
	},
	transpileDependencies: [
		"vuetify"
	]
}
