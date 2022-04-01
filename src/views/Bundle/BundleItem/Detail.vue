<template>
	<v-card max-height="100vh" tile flat style="overflow: auto;">
		<v-card-title class="text-h5 text-uppercase">
			{{ pkg.owner_name }} / {{ pkg.name }}
		</v-card-title>
		<v-row class="ma-0">
			<v-col cols="8">
				<div v-if="tree.type === 'tree'">
					<v-card-text>
						<v-card>
							<v-card-text class="blue-grey lighten-5">
								{{ $t('bundle.folder-tree') }}
							</v-card-text>
							<v-list>
								<v-list-item  v-for="(item, idx) of tree.data" :key="item.name + idx" dense>
									<v-list-item-icon class="mr-2">
										<v-icon>{{ item.type === 'tree' ? 'mdi-folder' : 'mdi-file-outline' }}</v-icon>
									</v-list-item-icon>
									<v-list-item-content>
										<v-list-item-title class="font-weight-light" v-text="item.name"></v-list-item-title>
									</v-list-item-content>
								</v-list-item>
							</v-list>
						</v-card>
					</v-card-text>
					<v-card-text style="overflow-y: auto;">
						<v-card>
							<v-card-text class="blue-grey lighten-5">README.md</v-card-text>
							<v-card-text v-html="readmeMarkdown"></v-card-text>
						</v-card>
					</v-card-text>
				</div>
			</v-col>
			<v-col cols="4">
				<div style="position: fixed; display: contents;" class="col col-4 pa-0">
					<v-card-text class="pb-0 px-0">
						<h3 class="mb-2">{{ $t('bundle.description') }}</h3>
						<p class="text-caption">{{ pkg.description }}</p>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions class="pb-0 px-0">
						<v-btn
							v-if="isPackageUsing"
							block
							:dark="!loading"
							:loading="loading"
							:disabled="loading"
							@click="uninstall"
							color="red darken-1">
							{{ $t('bundle.store.remove-bundle') }}
						</v-btn>
						<v-btn
							v-else
							block
							:dark="!loading"
							:loading="loading"
							:disabled="loading"
							@click="install"
							color="indigo darken-2">
							{{ $t('bundle.install') }}
						</v-btn>
					</v-card-actions>
				</div>
			</v-col>
		</v-row>
	</v-card>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import BundleMixin from '../bundle-mixin';
import { BundlePackage } from '@/interface/bundle';
import hljs from 'highlight.js';
import * as marked from 'marked/lib/marked.umd.js';
import path from 'path';

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
	public tree: any = {};
	public treePath: string = '';

	get readmeMarkdown() {
		return marked.marked(this.readme).replace(/\n/g, '<br>');
	}

	public created() {
		this.updatePackageUsing();
		this.renderTree();
	}

	public async renderTree() {
		let res = await this.$api.req('GET', `/bundle/${this.pkg.name}/${this.pkg.version}/tree/${this.treePath}`);
		this.tree = res.data[0];
		if ( this.tree.type === 'tree' ) {
			res = await this.$api.req('GET', `/bundle/${this.pkg.name}/${this.pkg.version}/tree/${path.join(this.treePath, 'README.md')}`);
			if ( !res.error ) {
				const file = res.data[0];
				const buf = Buffer.from(file.data, file.encoding);
				this.readme = buf.toString();
			}
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
