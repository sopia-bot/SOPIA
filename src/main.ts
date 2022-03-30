/*
 * main.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */
// native modules
import path from 'path';
import pkg from '../package.json';
import Carousel3d from 'vue-carousel-3d';
const fs = window.require('fs');

// pkacage modules
import Vue from 'vue';
import * as spoon from '@sopia-bot/core';
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
import { SopiaAPI } from '@/plugins/sopia-api';
import axios, { AxiosInstance } from 'axios';

import App from '@/App.vue';
import { getAppPath, getStartTime } from './plugins/ipc-renderer';
const { ipcRenderer } = electron;

/* tslint:disable-next-line */
(document.querySelector('title') as any).innerText = `SOPIA - ${pkg.version}`;

// Vue Use
Vue.use(Carousel3d);
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

window.isDevelopment = ipcRenderer.sendSync('isdev');
const appCfgPath = path.join(getAppPath('userData'), 'app.cfg');
Vue.prototype.$cfg = window.appCfg = new CfgLite(appCfgPath);
Vue.prototype.$api = new SopiaAPI();
window.axios = axios;

const api = window.appCfg.get('api');
if ( api ) {
	if ( api.host ) {
		Vue.prototype.$api.host = api.host;
	}
	if ( api.protocol ) {
		Vue.prototype.$api.protocol = api.protocol;
	}
}

Vue.config.productionTip = false;
window.$spoon = spoon;
Vue.prototype.$sopia = window.$sopia = new spoon.SpoonClient(uuidv4()); // TODO: set country

// Event Bus
Vue.prototype.$evt = new Vue();


declare global {
	interface Window {
		logger: any;
		appCfg: CfgLite;
		isDevelopment: boolean;
		axios: AxiosInstance;
	}
}
window.logger = Logger;

// config
Vue.config.errorHandler = function(err: any, vm: any, info) {
	Logger.critical('error', err);

	let str = '';
	str += `${new Date().toLocaleString()}\n`;
	str += `ReferenceError: ${err.message}\n`;
	if ( err.stack ) {
		str += `${err.stack.split('\n')[1]}\n`;
	}
	str += `    - ${vm.$options._componentTag}::${info}\n\n`;


	const logDir = path.join(getAppPath('userData'), 'logs');
	if ( !fs.existsSync(logDir) ) {
		fs.mkdirSync(logDir);
	}
	const sTime = getStartTime();
	const logFile = path.join(logDir, `${sTime}-error.log`);

	fs.appendFileSync(logFile, str, 'utf8');
};

window.$sopia.init()
	.then(() => {
		new Vue({
			router,
			store,
			vuetify,
			render: (h) => h(App),
		}).$mount('#app');
	});
