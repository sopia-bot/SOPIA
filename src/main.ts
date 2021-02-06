/*
 * main.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */
// native modules
import path from 'path';
const fs = window.require('fs');

// pkacage modules
import Vue from 'vue';
import * as spoon from 'sopia-core';
import { v4 as uuidv4 } from 'uuid';
import LiquorTree from 'liquor-tree';
import VueScroll from 'vuescroll';
const electron = window.require('electron');

// custom modules
import router from '@/router';
import store from '@/store';
import vuetify from '@/plugins/vuetify';
import Logger from '@/plugins/logger';
import CfgLite from '@/plugins/cfg-lite-ipc';

import App from '@/App.vue';
const { remote } = electron;
const { app } = remote;

// Vue Use
Vue.use(Logger);
Vue.use(LiquorTree);
Vue.use(VueScroll, {
	ops: {
		rail: {
			background: '#000',
			opacity: 0,
			size: '8px',
		},
		bar: {
			showDelay: 500,
			onlyShowBarOnScroll: true,
			background: '#7a7a7a',
			keepShow: false,
			opacity: 0.5,
			size: '6px',
		},
	},
});

Vue.config.productionTip = false;
window.$spoon = spoon;
Vue.prototype.$sopia = window.$sopia = new spoon.Client(uuidv4()); // TODO: set country

// Event Bus
Vue.prototype.$evt = new Vue();

const appCfgPath = path.join(app.getPath('userData'), 'app.cfg');

Vue.prototype.$cfg = new CfgLite(appCfgPath);

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
