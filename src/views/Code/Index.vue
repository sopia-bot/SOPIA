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
				<monaco-editor
					ref="code-editor"
					class="editor"
					v-model="editor.code"
					:language="editor.language"
					@editorDidMount="editorDidMount"
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
	};

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

	public editorDidMount(editor: any) {
		editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_S, () => {
			this.save(editor);
		});
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
			//const ext = path.extname(file);
			let rtn = { result: true, line: 0 } as any;
			const ext: string = '.js';
			switch ( ext ) {
				case '.js':
					rtn = this.jsSyntax(editor.getValue());
					break;
				case '.json':
					rtn = this.jsSyntax(`JSON.parse(\n${editor.getValue()}\n)`);
					rtn.line -= 1;
					break;
			}
			if ( !rtn.result ) {
				this.$modal({
					title: rtn.msg,
					content: `At line ${rtn.line}.<br>${rtn.syntax}`,
				});
				return;
			}

			//fs.writeFileSync(this.selectPath, editor.getValue(), {encoding: 'utf8'});
					/*
			this.$notify({
				type: 'primary',
				message: this.$t('code.noti.save-success'),
				horizontalAlign: 'right',
				verticalAlign: 'bottom',
			});
			*/
		} catch (err) {
			/*
			this.$notify({
				type: 'danger',
				message: err.message,
				horizontalAlign: 'right',
				verticalAlign: 'bottom',
			});
			*/
			console.error(err);
		}
	}

	public selectedItem(node: any) {
		if ( node.data.isFolder ) {
			// folder something to do.
		} else {
			const file = node.data.value;

			/*
			TODO: Manifualting open tab
			const idx = this.openedTabs.findIndex((tab) => tab.data.value === file);
			if ( idx === -1 ) {
				this.openedTabs.push(node);
			}
			*/
			if ( fs.existsSync(file) ) {
				const data = fs.readFileSync(file, { encoding: 'utf-8' });
				this.editor.code = data;
				this.editor.language = this.getLanguage(path.extname(file));

				node.select();

				//localStorage.setItem(`${this.targetFolder}-last-select`, file);
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
