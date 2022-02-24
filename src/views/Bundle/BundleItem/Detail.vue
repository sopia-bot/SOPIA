<template>
	<v-card height="80vh" tile flat>
		<v-card-title class="text-h3 text-uppercase">
			{{ pkg.name }}
		</v-card-title>
		<v-card-text style="height: calc(80vh - 128px); overflow-y: auto;">
			<div v-html="readmeMarkdown"></div>
		</v-card-text>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn
				v-if="isPackageUsing"
				color="red darken-1"
				tile depressed
				:dark="!loading"
				:loading="loading"
				:disabled="loading"
				@click="uninstall">
				{{ $t('uninstall') }}
			</v-btn>
			<v-btn
				v-else
				color="indigo darken-1"
				tile depressed
				:dark="!loading"
				:loading="loading"
				:disabled="loading"
				@click="install">
				{{ $t('install') }}
			</v-btn>
		</v-card-actions>
	</v-card>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import BundleMixin from '../bundle-mixin';
import { BundlePackage } from '@/interface/bundle';
import hljs from 'highlight.js';
import * as marked from 'marked/lib/marked.umd.js';

const fs = window.require('fs');

const mappingLanguage = (language: string) => {
	switch ( language ) {
		case 'js': return 'javascript';
		case 'ts': return 'typescript';
	}
	return language;
};

marked.setOptions({
	langPrefix: 'hljs language-',
	highlight: (code: string, language: string) => {
		try {
			language = mappingLanguage(language);
			return hljs.highlight(language, code).value;
		} catch {
			return code;
		}
	},
});


@Component
export default class BundleItemDetail extends Mixins(BundleMixin) {

	@Prop(Object) public pkg!: BundlePackage;

	public isPackageUsing = false;
	public readme: string = '';

	public loading: boolean = false;

	get readmeMarkdown() {
		return marked.marked(this.readme).replace(/\n/g, '<br>');
	}

	public async created() {
		this.updatePackageUsing();
		const res = await this.$api.req('GET', `/bundle/blob/${this.pkg.name}/${this.pkg.version}/README.md`);
		if ( !res.error ) {
			const file = res.data[0];
			const buf = Buffer.from(file.content, file.contentEncoding);
			this.readme = buf.toString();
		}
	}

	public async install() {
		this.loading = true;
		await this.bundleInstall(this.pkg);
		this.updatePackageUsing();
		window.reloadScript();
		this.$evt.$emit('sidemenu:bundle-reload');
		this.loading = false;
	}

	public async uninstall() {
		this.loading = true;
		await this.bundleUninstall(this.pkg);
		this.updatePackageUsing();
		window.reloadScript();
		this.$evt.$emit('sidemenu:bundle-reload');
		this.loading = false;
	}

	private updatePackageUsing() {
		this.isPackageUsing = fs.existsSync(this.getBundlePath(this.pkg));
	}

}
</script>