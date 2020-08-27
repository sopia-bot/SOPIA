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
					<div v-if="treeRenderer">
						<tree
							class="custom"
							ref="tree"
							:key="folderKey"
							style="overflow-y: auto;"
							:data.sync="folderTree">
						<span class="tree-text" slot-scope="{ node }">
							<!-- S:Folder -->
							<template v-if="node.hasChildren()">
								<div @contextmenu.stop="itemContextMenu($event, node)">
									{{ node.text }}
								</div>
							</template>
							<!-- E:Folder -->

							<!-- S:File -->
							<template v-else>
								<div @contextmenu.stop="itemContextMenu($event, node)">
									<i :class="node.data.icon"></i>
									{{ node.text }}
								</div>
							</template>
							<!-- E:File -->
						</span>
						</tree>
					</div>
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
const path = window.require('path');
const fs = window.require('fs');

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

	/* S:For Tree */
	public treeRenderer: boolean = true;
	public folderKey: number = 0;
	public folderTree: any = [];
	public oriFolderTree: any = [];
	public targetFolder: string = '';
	public selectPath: string = '';
	/* E:For Tree */

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

	public checkFolder() {
		return new Promise((resolve, reject) => {
			const dist = this.$path('userData', this.targetFolder);
			if ( !fs.existsSync(dist) ) {
				fs.mkdir(dist, (err: any) => {
					if ( err ) {
						reject(err);
						return;
					}
					resolve();
				});
			} else {
				resolve();
			}
		});
	}

	public iconFinder(ext: string) {
		switch (ext.toLowerCase()) {
			case '.md': return 'fab fa-markdown';
			case '.js': return 'fab fa-js';
			case '.vue': return 'fab fa-vuejs';
			case '.json': return 'fas fa-bullseye';
			case '.html': return 'fab fa-html5';
		}
		return 'fa fa-file';
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

	public mounted() {
		document.addEventListener('click', () => {
			if ( this.cm && this.cm.display ) {
				this.cm.display = 'none';
			}
		});


		this.treeRenderer = false;
		this.folderTree = this.buildFolderTree(this.$path('userData', this.targetFolder), this.$route.params.file);
		this.treeReload((tree: any) => {
			const folder = this.$route.params.folder;
			const file = this.$route.params.file;
			if ( file ) {
				const fullPath = this.$path('userData', path.join(folder, file));
				const t = tree.model;

				const node = this.searchNode(t, fullPath);
				if ( node ) {
					node.select(true);
				}
			}
		});
	}

	public FitemClick(node: any) {
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
				this.selectPath = file;

				node.select();

				localStorage.setItem(`${this.targetFolder}-last-select`, file);
			} else {
				console.warn(file, 'not exists');
			}
		}
	}

	public treeReload(cb: (...args: any) => any = () => {/* empty */}) {
		const treeRef = this.$refs.tree as any;
		const tree = treeRef.tree;
		this.oriFolderTree = tree.model;
		this.treeRenderer = false;
		this.folderTree = this.buildFolderTree(this.$path('userData', this.targetFolder));
		this.$nextTick()
			.then(() => {
				this.treeRenderer = true;
				this.$forceUpdate();
				this.folderKey += 1;

				this.$nextTick()
					.then(() => {
						treeRef.$on('node:selected', this.FitemClick);

						if ( this.selectPath ) {
							const node = this.searchNode(tree.model, this.selectPath);
							if ( node ) {
								node.select(true);
							}
						}

						cb(tree);
					});
			});
	}

	public searchNode(nodes: any, value: any): any {
		for ( const node of nodes ) {
			if ( node.children.length === 0 ) {
				// file
				if ( node.data.value === value ) {
					return node;
				}
			} else {
				// folder
				if ( value.match(node.data.value) ) {
					if ( !node.states.expanded ) {
						node.toggleExpand();
					}
					return this.searchNode(node.children, value);
				}
			}
		}
	}

	public buildFolderTree(src: string, selectedFile: string = '') {
		const ori = this.oriFolderTree;
		const readdir = (PATH: string, DIR: string = '', ORI: any, sf?: any[]) => {
			DIR = DIR || '';
			const target = path.join(DIR, PATH);

			if ( fs.existsSync(target) ) {
				const fll = fs.readdirSync(target);
				const arr: any = [];

				if ( Array.isArray(fll) ) {
					const fl = fll.sort((a, b) => {
						const statsA = fs.statSync(path.join(target, a));
						const statsB = fs.statSync(path.join(target, b));
						if ( statsA.isDirectory() ) {
							return -1;
						} else if ( statsB.isDirectory() ) {
							return 1;
						}
						return a > b ? 1 : -1;
					});

					fl.forEach((f) => {
						const fullPath = path.join(target, f);
						const stats = fs.statSync(fullPath);
						const obj: any = { data: {} };
						const oriObjIdx = Array.isArray(ORI) ? ORI.findIndex((oo) => {
							if ( oo.data['value'] === fullPath ) { return true; }
							if ( oo.data['value'] === this.cm.rename.value ) { return true; }
						}) : -1;
						const oriObj = oriObjIdx >= 0 ? ORI[oriObjIdx] : {};

						obj['text'] = f;
						obj.data['value'] = fullPath;

						if ( stats.isDirectory() ) {
							let expanded = false;
							if ( sf && sf.length > 0 ) {
								const p = sf.shift();
								expanded = (p === f);
							} else {
								expanded = (oriObj['states'] && oriObj['states'].expanded);
							}
							obj['state'] = {
								expanded,
							};
							obj.data['isFolder'] = true;
							obj['children'] = readdir(fullPath, '', oriObj && oriObj.children );

						} else {
							obj['state'] = oriObj['state'] || {};
							obj.data['isFolder'] = false;
							obj.data['icon'] = this.iconFinder(path.extname(f));
						}

						arr.push(obj);
					});
				}
				return arr;
			} else {
				this.checkFolder();
				return [];
			}
		};

		const sfs = selectedFile ? selectedFile.split('/') : [];
		return readdir(src, '', ori, sfs);
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
