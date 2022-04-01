<template>
	<v-card max-height="100vh" tile flat style="overflow: auto;">
		<v-card-title class="text-h5 pb-0">
			{{ pkg.owner_name }} / {{ pkg.name }}
			<v-spacer></v-spacer>
			<v-btn icon @click="$emit('close')">
				<v-icon>mdi-close</v-icon>
			</v-btn>
		</v-card-title>
		<v-row class="ma-0">
			<v-col cols="8">
				<div>
					<v-card-text>
						<v-card>
							<v-card-text class="blue-grey lighten-5">
								<span v-for="(item, idx) of breadcrumbs" :key="item.to">
									<span v-if="item.disabled">{{ item.text }}</span>
									<span v-else class="breadcrumbs-link" @click="to(item.to)">{{ item.text }}</span>
									{{ idx < breadcrumbs.length - 1 ? '/' : '' }}
								</span>
							</v-card-text>
							<v-list  v-if="tree.type === 'tree'">
								<v-list-item  v-for="(item, idx) of tree.data" :key="item.name + idx" dense>
									<v-list-item-icon class="mr-2">
										<v-icon>{{ item.type === 'tree' ? 'mdi-folder' : 'mdi-file-outline' }}</v-icon>
									</v-list-item-icon>
									<v-list-item-content>
										<v-list-item-title
											class="font-weight-light tree-link"
											v-text="item.name"
											@click="selectFile(item)"></v-list-item-title>
									</v-list-item-content>
								</v-list-item>
							</v-list>
						</v-card>
					</v-card-text>
					<v-card-text v-if="readme" style="overflow-y: auto;">
						<v-card>
							<v-card-text class="blue-grey lighten-5">{{ nowFile }}</v-card-text>
							<v-card-text v-if="fileLang === 'markdown'" v-html="readmeMarkdown"></v-card-text>
							<v-card-text v-else>
								<monaco-editor
									class="editor"
									v-model="readme"
									:language="fileLang"
									theme="vs"
									:style="{ minHeight: editorHeight }"
									:options="{
										automaticLayout: true,
										readOnly: true,
										smoothScrolling: true,
										minimap: {
											enabled: false,
										},
									}"></monaco-editor>
							</v-card-text>
						</v-card>
					</v-card-text>
				</div>
			</v-col>
			<v-col cols="4">
				<div style="position: fixed; display: contents;" class="col col-4 pa-0">
					<v-card-text class="pb-0 px-0">
						<h3 class="mb-2">{{ $t('bundle.description') }}</h3>
						<p class="text-caption">{{ description }}</p>
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
<style>
.tree-link {
	cursor: pointer;
}
.tree-link:hover {
	color: #032f62;
	text-decoration-line: underline;
}
.breadcrumbs-link {
	cursor: pointer;
	color: #032f62;
}
.breadcrumbs-link:hover {
	text-decoration-line: underline;
}
.editor {
	width: 100%;
	height: 100%;
}
.editor > .monaco-editor {
	margin: 0;
	width: 100% !important;
	/* padding-top: 7px; */
}
.editor > .monaco-editor > .overflow-guard {
	margin: 0;
	width: 100% !important;
}
</style>
<script lang="ts">
import MonacoEditor from 'vue-monaco';
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


@Component({
	components: {
		MonacoEditor,
	},
})
export default class BundleItemDetail extends Mixins(BundleMixin) {

	@Prop(Object) public pkg!: BundlePackage;

	public isPackageUsing = false;
	public readme: string = '';

	public loading: boolean = false;
	public tree: any = {};
	public treePath: string = '';
	public nowFile: string = '';

	get fileLang() {
		return this.getLanguage(path.extname(this.nowFile));
	}

	get editorHeight() {
		let height = (50 + this.readme.split('\n').length * 10) ;
		if ( height > 650 ) {
			height = 650;
		}
		return height + 'px';
	}

	get readmeMarkdown() {
		switch ( this.fileLang ) {
			case 'markdown':
				return marked.marked(this.readme).replace(/\n/g, '<br>');
		}
	}

	get breadcrumbs() {
		let href = '';
		const map = this.treePath
			.split('/')
			.map((p, idx, arr) => {
				href = path.join(href, p);
				const d = {
					text: p,
					to: href,
					disabled: false,
				};
				if ( arr.length - 1 === idx ) {
					d.disabled = true;
				}
				return d;
			});
		map.unshift({
			text: this.pkg.name,
			to: '',
			disabled: false,
		});
		return map;
	}

	public getLanguage(ext: string) {
		switch (ext.toLowerCase()) {
			case '.ts': return 'typescript';
			case '.js': return 'javascript';
			case '.json': return 'json';
			case '.md': return 'markdown';
			case '.vue':
			case '.html':
				return 'html';
		}
		return 'javascript';
	}

	public created() {
		this.updatePackageUsing();
		this.renderTree();
	}

	public async renderTree() {
		let res = await this.$api.req('GET', `/bundle/${this.pkg.name}/${this.pkg.version}/tree/${this.treePath}`);
		this.tree = res.data[0];
		this.nowFile = path.basename(this.treePath);
		if ( this.tree.type === 'tree' ) {
			res = await this.$api.req('GET', `/bundle/${this.pkg.name}/${this.pkg.version}/tree/${path.join(this.treePath, 'README.md')}`);
			if ( !res.error ) {
				const file = res.data[0];
				const buf = Buffer.from(file.data, file.encoding);
				this.nowFile = 'README.md';
				this.readme = buf.toString();
			}
		} else {
			const buf = Buffer.from(this.tree.data, this.tree.encoding);
			this.readme = buf.toString();
		}
	}

	public to(str: string) {
		this.treePath = str;
		this.renderTree();
	}

	public selectFile(item: any) {
		this.tree = [];
		this.readme = '';
		this.to(path.join(this.treePath, item.name));
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
