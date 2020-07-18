/*
 * main.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */
// native modules
import path from 'path';
import fs from 'fs';

// pkacage modules
import Vue from 'vue';
import * as spoon from 'sopia-core';
const electron = window.require('electron');

// custom modules
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import Logger from './plugins/logger';

import App from './App.vue';
const { remote } = electron;
const { app } = remote;

// Vue Use
Vue.use(Logger);

Vue.config.productionTip = false;
Vue.prototype.$sopia = new spoon.Client(); // TODO: set country

// Event Bus
Vue.prototype.$evt = new Vue();

// config
Vue.config.errorHandler = function(err: any, vm: any, info) {
	Logger.critical('error', err);

	let str = '';
	str += `${new Date().toLocaleString()}\n`;
	str += `ReferenceError: ${err.message}\n`;
	str += `${err.stack.split('\n')[1]}\n`;
	str += `    - ${vm.$options._componentTag}::${info}\n\n`;


	const logDir = path.join(app.getPath('userData'), 'logs');
	if ( !fs.existsSync(logDir) ) {
		fs.mkdirSync(logDir);
	}
	const sTime = remote.getGlobal('startTime');
	const logFile = path.join(logDir, `${sTime}-error.log`);

	fs.appendFileSync(logFile, str, 'utf8');
};

new Vue({
	router,
	store,
	vuetify,
	render: (h) => h(App),
}).$mount('#app');
