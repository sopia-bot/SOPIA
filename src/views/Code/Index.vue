<!--
 * Index.vue
 * Created on Wed Aug 26 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<v-main style="overflow-y: hidden;">
		<v-row class="ma-0 h-100v" style=" overflow-y: hidden;">
			<v-col cols="4" md="3" lg="2" class="pa-0 d-none d-sm-block h-100v" style="border-right: 1px solid #E8EAF6;">
				<v-row class="ma-0" style="border-bottom: 1px solid #E8EAF6;">
					<v-col cols="12" align="center">
						<!-- S:Toolbar -->
						<tool-button
							v-for="btn in buttons"
							:key="btn.name"
							:btn="btn"/>
						<!-- E:Toolbar -->
					</v-col>
				</v-row>
				<v-row class="ma-0" style="height: calc(100vh - 61px); overflow: auto;">
					<!-- S:Folder Tree -->
					<tree-view
						v-if="treeRenderer"
						@contextmenu="openContextmenu"
						@selected="selectedItem"
						/>
					<!-- E:Folder Tree -->
				</v-row>
			</v-col>
			<v-col cols="12" sm="8" md="9" lg="10" class="pa-0">
				<v-tabs
					v-model="selectedFile"
	 				background-color="indigo lighten-1"
					show-arrows
					color="white" dark>
					<v-tab
						v-for="(opened, idx) in openFiles"
	  					@click="selectedItem(opened.node, true)"
						style="text-transform: unset;"
	  					class="pr-2"
						:key="opened.name + idx">
						<v-icon small v-if="opened.isEdit" class="mr-2">
							mdi-source-commit-start-next-local
						</v-icon>
						{{ opened.name }}
						<v-btn
							icon small
		  					@click.stop="closeTab"
							class="ml-2 mr-0"
							color="white">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</v-tab>
				</v-tabs>
				<monaco-editor
					ref="code-editor"
					class="editor"
					v-model="editor.code"
					:language="editor.language"
					@editorDidMount="editorDidMount"
	 				@change="editorChange"
					:theme="editor.theme"
					:options="editor.options"/>
			</v-col>
		</v-row>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import MonacoEditor from 'vue-monaco';
import TreeView from './TreeView.vue';
import ToolButton, { ToolButtonInterface } from './ToolButton.vue';
const fs = window.require('fs');
const path = window.require('path');

declare global {
	interface Window {
		monaco: any;
	}
}

interface ContextMenu {
	left: number;
	top: number;
	display: string;
	target: any;
	rename: any;
}

interface TabFile {
	name: string;
	fullPath: string;
	contents: string;
	oriContents: string;
	isEdit: boolean;
	node: any;
}

@Component({
	components: {
		MonacoEditor,
		TreeView,
		ToolButton,
	},
})
export default class Code extends Mixins(GlobalMixins) {
	public editor: any = {
		options: {
			automaticLayout: true,
		},
		language: 'javascript',
		code: '',
		theme: 'vs',
		changed: false,
	};
	public openFiles: TabFile[] = [];
	public selectedFile: number = -1;

	public treeRenderer: boolean = true;

	public cm: ContextMenu = {
		left: 0,
		top: 0,
		display: 'none',
		target: null,
		rename: {
			display: 'none',
			value: '',
		},
	};

	public buttons: ToolButtonInterface[] = [
		{
			icon: 'mdi-file-document-multiple',
			name: this.$t('code.menu.new-file'),
			func: () => {
				console.log(this.editor);
			},
		},
		{
			icon: 'mdi-folder-plus',
			name: this.$t('code.menu.new-folder'),
			func: () => {
				console.log(this.editor);
			},
		},
		{
			icon: 'mdi-form-textbox',
			name: this.$t('code.menu.rename'),
			func: () => {
				console.log(this.editor);
			},
		},
		{
			icon: 'mdi-delete',
			name: this.$t('code.menu.unlink'),
			func: () => {
				console.log(this.editor);
			},
		},
	];

	public closeTab() {
		//TODO: confirm

		this.openFiles.splice(this.selectedFile, 1);
		this.$nextTick()
			.then(() => {
				this.selectedFile = this.openFiles.length - 1;
				this.selectedItem(this.openFiles[this.selectedFile].node);
			});
	}

	public editorDidMount(editor: any) {
		// save
		editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_S, () => {
			this.save(editor);
		});

		// close
		editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_W, () => {
			this.closeTab();
		});
	}

	public editorChange(value: string, editor: any) {
		const openedFile = this.openFiles[this.selectedFile];
		openedFile.contents = value;

		openedFile.isEdit = openedFile.contents !== openedFile.oriContents;
	}

	public openContextmenu(event: any, node: any) {
		console.log('openContextmenu', event, node);
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

	public save(editor: any) {
		try {
			const openedFile = this.openFiles[this.selectedFile];
			const ext = path.extname(openedFile.name);
			let rtn: any = { result: true, line: 0 };

			switch ( ext ) {
				case '.js':
					rtn = this.jsSyntax(openedFile.contents);
					break;
				case '.json':
					rtn = this.jsSyntax(`JSON.parse(\n${openedFile.contents}\n)`);
					rtn.line -= 1;
					break;
			}
			if ( !rtn.result ) {
				this.$modal({
					type: 'error',
					title: rtn.msg,
					content: `At line ${rtn.line}.<br>${rtn.syntax}`,
				});
				return;
			}

			fs.writeFileSync(openedFile.fullPath, openedFile.contents, {encoding: 'utf8'});
			openedFile.oriContents = openedFile.contents;

			this.$noti({
				type: 'success',
				content: this.$t('code.msg.save-success'),
				horizontal: 'right',
				vertical: 'bottom',
				timeout: 2000,
			});
		} catch (err) {
			this.$modal({
				type: 'error',
				title: 'Error',
				content: err.message,
			});
		}
	}

	public selectedItem(node: any) {
		if ( node.data.isFolder ) {
			// folder something to do.
		} else {
			const file = node.data.value;


			const idx = this.openFiles.findIndex((opened) => opened.name === node.data.text);

			if ( idx >= 0 ) {
				const openFile = this.openFiles[idx];
				this.editor.code = openFile.contents;
				this.editor.language = this.getLanguage(path.extname(openFile.name));

				node.select();
				this.selectedFile = idx;
				this.$emit('selected', node);
			} else if ( fs.existsSync(file) ) {
				const data = fs.readFileSync(file, { encoding: 'utf-8' });
				this.editor.code = data;
				this.editor.language = this.getLanguage(path.extname(file));

				node.select();

				if ( idx === -1 ) {
					this.openFiles.push({
						name: node.data.text,
						fullPath: node.data.value,
						contents: data,
						oriContents: data,
						isEdit: false,
						node,
					});
					this.selectedFile = this.openFiles.length - 1;
				} else {
					this.selectedFile = idx;
				}

				this.$emit('selected', node);
			} else {
				this.$logger.warn(file, 'not exists');
			}
		}
	}

	public mounted() {
		document.addEventListener('click', () => {
			if ( this.cm && this.cm.display ) {
				this.cm.display = 'none';
			}
		});
	}
}
</script>
<style scope>
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
