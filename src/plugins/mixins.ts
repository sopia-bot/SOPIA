/*
 * mixins.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */

import Vue from 'vue';
import { Component, Vue as VueDecorator } from 'vue-property-decorator';
import Vuetify from '..//plugins/vuetify';

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
}
