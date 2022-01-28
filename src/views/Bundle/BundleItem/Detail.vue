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
				dark tile depressed
				@click="uninstall">
				{{ $t('uninstall') }}
			</v-btn>
			<v-btn
				v-else
				color="indigo darken-1"
				dark tile depressed
				@click="install">
				{{ $t('install') }}
			</v-btn>
		</v-card-actions>
	</v-card>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { BundlePackage } from '@/interface/bundle';
import path from 'path';
import hljs from 'highlight.js';

const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');
const marked = window.require('marked');

const mappingLanguage = (language: string) => {
	switch ( language ) {
		case 'js': return 'javascript';
		case 'ts': return 'typescript';
	}
	return language;
};

console.log('marked', marked);

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
export default class BundleItemDetail extends Mixins(GlobalMixins) {

	@Prop(Object) public pkg!: BundlePackage;

	public bundlePath = path.join(this.$path('userData', 'bundles'), this.pkg.name);
	public isPackageUsing = false;
	public readme: string = '';

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
		const res = await this.$api.req('GET', `/bundle/download/${this.pkg.name}/${this.pkg.version}/`);
		ipcRenderer.sendSync('zip:uncompress-buffer', res.data[0], this.bundlePath);
		this.updatePackageUsing();

		this.$noti({
			type: 'success',
			horizontal: 'right',
			vertical: 'bottom',
			content: this.$t('bundle.store.install-scucess', this.pkg.name),
			timeout: 3000,
		});
	}

	public async uninstall() {
		this.$confirm({
			title: this.$t('bundle.store.remove-bundle'),
			content: this.$t('bundle.store.remove-bundle-desc', this.pkg.name),
			textOk: this.$t('yes'),
			textCancel: this.$t('no'),
		}).then((close) => {
			fs.rmdirSync(this.bundlePath, { recursive: true });
			this.updatePackageUsing();
			this.$noti({
				type: 'success',
				horizontal: 'right',
				vertical: 'bottom',
				content: this.$t('bundle.store.remove-bundle-success', this.pkg.name),
				timeout: 3000,
			});
			close();
		}).catch((close) => {
			close();
		});
	}

	private updatePackageUsing() {
		this.isPackageUsing = fs.existsSync(this.bundlePath);
	}

}
</script>