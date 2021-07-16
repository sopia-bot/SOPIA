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
import Confirm from '@/views/Components/Confirm.vue';
import Notification from '@/views/Components/Notification.vue';

import { NotiOption, ModalOption, ConfirmOption } from '@/interface/Components';

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

	public asleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
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

	public $noti(options: NotiOption = {}): Promise<void> {
		return new Promise((resolve, reject) => {
			const defaultOptions: NotiOption = {
				open: true,
				type: 'none',
				content: 'Snackbar Content',
				timeout: 5000,
				horizontal: 'center',
				vertical: 'middle',
			};

			for ( const [key, val] of Object.entries(options) as Array<[keyof NotiOption, any]> ) {
				if ( typeof defaultOptions[key] !== 'undefined' ) {
					defaultOptions[key] = val;
				}
			}

			if ( typeof options.vuetify === 'undefined' ) {
				options.vuetify = Vuetify;
			}

			let instance: any = this.mount(Notification, { propsData: defaultOptions });
			setTimeout(() => {
				Vue.nextTick(() => {
					instance.$el.remove();
					instance = null;
				});
				resolve();
			}, defaultOptions.timeout);
			document.body.appendChild(instance.$el);
		});
	}

	public $modal(options: ModalOption = {}): Promise<() => void> {
		return new Promise((resolve, reject) => {
			const defaultOptions: ModalOption = {
				open: true,
				type: 'none',
				title: 'Modal Title',
				content: 'Modal Content',
				textOk: 'Ok',
				loading: false,
			};

			for ( const [key, val] of Object.entries(options) as Array<[keyof ModalOption, any]> ) {
				if ( typeof defaultOptions[key] !== 'undefined' ) {
					defaultOptions[key] = val;
				}
			}

			if ( typeof options.vuetify === 'undefined' ) {
				options.vuetify = Vuetify;
			}

			let instance: any = this.mount(Modal, { propsData: defaultOptions });
			instance.$on('ok', () => {
				instance.loading = true;
				resolve(() => {
					instance.loading = false;
					instance.open = false;
					Vue.nextTick(() => {
						instance.$el.remove();
						instance = null;
					});
				});
			});
			document.body.appendChild(instance.$el);
		});
	}

	public $confirm(options: ConfirmOption = {}): Promise<() => void> {
		return new Promise((resolve, reject) => {
			const defaultOptions: ConfirmOption = {
				open: true,
				type: 'none',
				title: 'Confirm Title',
				content: 'Confirm Content',
				textOk: 'Ok',
				textCancel: 'Cancel',
				loading: false,
			};

			for ( const [key, val] of Object.entries(options) as Array<[keyof ConfirmOption, any]> ) {
				if ( typeof defaultOptions[key] !== 'undefined' ) {
					defaultOptions[key] = val;
				}
			}

			if ( typeof options.vuetify === 'undefined' ) {
				options.vuetify = Vuetify;
			}

			let instance: any = this.mount(Confirm, { propsData: defaultOptions });
			instance.$on('ok', () => {
				instance.loading = true;
				resolve(() => {
					instance.loading = false;
					instance.open = false;
					Vue.nextTick(() => {
						instance.$el.remove();
						instance = null;
					});
				});
			});
			instance.$on('cancel', () => {
				instance.loading = true;
				reject(() => {
					instance.loading = false;
					instance.open = false;
					Vue.nextTick(() => {
						instance.$el.remove();
						instance = null;
					});
				});
			});
			document.body.appendChild(instance.$el);
		});
	}

}
