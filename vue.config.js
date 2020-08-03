module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntergration: true,
			nodeModulesPath: ['./node_modules'],
		},
	},
	transpileDependencies: [
		"vuetify"
	]
}
