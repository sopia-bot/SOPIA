<!--
 * TreeView.vue
 * Created on Fri Aug 28 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<div v-if="treeRenderer" style="width: 100%;">
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
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
const path = window.require('path');
const fs = window.require('fs');

@Component
export default class TreeView extends Mixins(GlobalMixins) {
	/* S:For Tree */
	public treeRenderer: boolean = true;
	public folderKey: number = 0;
	public folderTree: any = [];
	public oriFolderTree: any = [];
	public targetFolder: string = '';
	public selectPath: string = '';
	/* E:For Tree */

	public mounted() {
		this.treeRenderer = false;
		this.targetFolder = this.$route.params.folder;
		this.folderTree = this.buildFolderTree(this.$path('userData', this.targetFolder));
		this.treeReload((tree: any) => {
			/*
			TODO: LAST Opend File open
			const file = this.$route.params.file;
			if ( file ) {
				const fullPath = this.$path('userData', path.join(folder, file));
				console.log(fullPath);
				const t = tree.model;

				const node = this.searchNode(t, fullPath);
				if ( node ) {
					node.select(true);
				}
			}
			*/
		});
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
				//this.editor.code = data;
				//this.editor.language = this.getLanguage(path.extname(file));
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
							//if ( oo.data['value'] === this.cm.rename.value ) { return true; }
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
