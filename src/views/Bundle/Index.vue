<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5" style="height: 100vh; overflow-y: auto;">
		<Store v-if="isStore"/>
		<component v-else-if="page" :is="page"></component>
		<div v-else></div>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import Store from './Store.vue';
import path from 'path';
import { BundlePackage } from '@/interface/bundle';
import * as VuetifyComponents from 'vuetify/lib/components';
import Scripts from '@/sopia/script';

const fs = window.require('fs');
const vm = window.require('vm');

@Component({
	components: {
		Store,
	},
})
export default class Bundle extends Mixins(GlobalMixins) {

	public basePath: string = this.$path('userData', 'bundles');
	public bundlePath: string = path.join(this.basePath, this.$route.params.bundle);
	public package!: BundlePackage;
	public page: any = null;

	get isStore() {
		return this.$route.params.bundle === 'store';
	}

	public getInnerString(txt: string, tag: string) {
		const regx = new RegExp(`<${tag}>((?:.|\r|\n)*)?</${tag}>`);
		const m: any = txt.match(regx);
		if ( m ) {
			return m[1];
		}
	}

	public loadBundlePage() {
		const packageFile = path.join(this.bundlePath, 'package.json');
		if ( !fs.existsSync(packageFile) ) {
			this.$logger.err('bundle', 'Could not find file.', packageFile);
		}
		this.package = JSON.parse(
			fs.readFileSync(
				packageFile,
				'utf8',
			),
		);

		const pageFile = path.join(this.bundlePath, this.package.page as string);
		if ( !fs.existsSync(pageFile) ) {
			this.$logger.err('bundle', 'Can not find bundle page file.', pageFile);
			return;
		}

		const page = fs.readFileSync(pageFile, 'utf8');
		const template = this.getInnerString(page, 'template');
		const script = this.getInnerString(page, 'script')
			.replace(/export\s+default\s+{/, 'module = {');

		const vmScript = new vm.Script(script);
		const context: any = {};
		context.module = {};
		context.window = window;
		context.__dirname = this.bundlePath;
		context.console = console;
		vmScript.runInNewContext(context);

		const component: any = {
			template,
			...context.module,
			mixins: [Mixins(GlobalMixins)],
		};
		if ( !component.methods ) {
			component.methods = {};
		}
		component.methods.reload = () => {
			Scripts.reload(this.package.name);
		};
		component.components = { ...VuetifyComponents };
		this.page = component;
	}

	public mounted() {
		if ( !this.isStore ) {
			this.loadBundlePage();
		}
	}

}
</script>
