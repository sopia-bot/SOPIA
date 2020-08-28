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
						<v-tooltip
							v-for="btn in buttons"
							:key="btn.name"
							bottom>
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									icon
									color="indigo lighten-1"
									class="mx-1"
									v-bind="attrs"
									v-on="on"
									@click="btn.func"
									>
									<v-icon>{{ btn.icon }}</v-icon>
								</v-btn>
							</template>
							<span>{{ btn.name }}</span>
						</v-tooltip>
						<!-- E:Toolbar -->
					</v-col>
				</v-row>
				<v-row class="ma-0" style="height: calc(100vh - 61px); overflow: auto;">
					<!-- S:Folder Tree -->
					<tree-view
						v-if="treeRenderer"
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

declare global {
	interface Window {
		monaco: any;
	}
}

interface MenuButton {
	icon: string;
	name: string;
	func: (...args: any) => void;
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

	public buttons: MenuButton[] = [
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

	public save(editor: any) {
		// empty
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

.custom .fa-js {
	color: #ffff59;
}

.custom .fa-vuejs {
	color: #41B883;
}

.custom .fa-markdown {
	color: #ff7657;
}

.custom .fa-bullseye {
	color: #5e72e4;
}

.custom .tree-arrow.has-child:after {
	border: 1.5px solid #263238;
    position: absolute;
    border-left: 0;
    border-top: 0;
    left: 9px;
    top: 50%;
    height: 9px;
    width: 9px;
    transform: rotate(-45deg) translateY(-50%) translateX(0);
    transition: transform .25s;
    transform-origin: center;
}

.custom .tree-anchor .tree-text {
	color: #263238;
}
.custom .tree-node.selected>.tree-content .tree-text {
}

.custom .tree-node:not(.selected)>.tree-content:hover {
	background: #ECEFF1;
}

.custom .tree-node.selected>.tree-content {
	background: #CFD8DC;
}

.custom .tree-arrow {
	margin-left: 0px;
}
</style>
