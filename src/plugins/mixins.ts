/*
 * mixins.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */

import Vue from 'vue';
import { Component, Vue as VueDecorator } from 'vue-property-decorator';
import Vuetify from '@/plugins/vuetify';

import Modal from '@/views/Components/Modal.vue';

const path = window.require('path');
const fs = window.require('fs');
const vm = window.require('vm');
const { remote } = window.require('electron');
const { app } = remote;

const jsOrPath = (code: string) => {
	try {
		if ( code.indexOf('\n') >= 0 ) {
			return 'code';
		}
		if ( path.extname(code) === '.js' ) {
			return 'path';
		}
	} catch (err) {
		return 'code';
	}
};

@Component
export default class Mixin extends VueDecorator {
	public $t(key: string) {
		const tmp: any = this;
		return tmp.$vuetify.lang.t('$vuetify.' + key);
	}

	public mount(component: any, options: any = {}, selector?: (string | HTMLElement)) {
		const instanceComponent = Vue.extend(component);

		if ( typeof options.vuetify === 'undefined' ) {
			options.vuetify = Vuetify;
		}

		const instance = new instanceComponent(options);
		instance.$mount(selector);

		return instance;
	}

	public $assign(url: string, newTab: boolean = false) {
		if ( newTab ) {
			window.open(url);
			return;
		}

		const router = this && this.$router;
		if ( router ) {
			if ( router.currentRoute.path !== url ) {
				router.push({ path: url });
			}
		}
	}

	public $path(type: any, ...args: any) {
		return path.resolve(app.getPath(type), ...args);
	}

	public jsSyntax(code: string) {
		if ( jsOrPath(code) === 'path' ) {
			code = fs.readFileSync(code, { encoding: 'utf8' });
		}
		try {
			const v: any = vm;
			v.createScript(code);
			return { result: true };
		} catch (err) {
			const sp = err.stack.split('\n');
			const line = sp[0].split(':')[1];
			const syntax = `${sp[1]}\n${sp[2]}`;
			return {
				result: false,
				msg: err.message,
				syntax,
				line,
				stack: err.stack,
			};
		}
	}

	public $modal(options: any = {}) {
		const defaultOptions: any = {
			open: true,
			type: 'none',
			title: 'Modal Title',
			content: 'Modal Content',
			textOk: 'Ok',
		};

		for ( const [key, val] of Object.entries(options) ) {
			if ( typeof defaultOptions[key] !== 'undefined' ) {
				defaultOptions[key] = val;
			}
		}

		if ( typeof options.vuetify === 'undefined' ) {
			options.vuetify = Vuetify;
		}

		let instance: any = this.mount(Modal, { propsData: defaultOptions });
		instance.$once('ok', (evt: any) => {
			if ( typeof options.ok === 'function' ) {
				options.ok(instance, evt);
			}
			instance.open = false;
			Vue.nextTick(() => {
				instance.$el.remove();
				instance = null;
			});
		});
		document.body.appendChild(instance.$el);
	}

}
