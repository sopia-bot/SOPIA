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
					<div @contextmenu.stop="$emit('contextmenu', $event, node)">
						{{ node.text }}
					</div>
				</template>
				<!-- E:Folder -->

				<!-- S:File -->
				<template v-else>
					<div @contextmenu.stop="$emit('contextmenu', $event, node)">
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
			case '.md': return 'mdi mdi-language-markdown';
			case '.js': return 'mdi mdi-language-javascript';
			case '.ts': return 'mdi mdi-language-typescript';
			case '.vue': return 'mdi mdi-vuejs';
			case '.json': return 'mdi mdi-code-json';
			case '.html': return 'mdi mdi-language-html5';
		}
		return 'mdi mdi-file-document';
	}

	public treeReload(cb: (...args: any) => any = () => {/* empty */}) {
		let treeRef = this.$refs.tree as any;
		let tree = treeRef.tree;
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
						treeRef = this.$refs.tree as any;
						tree = treeRef.tree;
						treeRef.$on('node:selected', (node: any) => {
							const file = node.data.value;
							this.selectPath = file;
							this.$emit('selected', node);
						});

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
<style scope>
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

.custom .mdi-language-javascript {
	color: #e8ba00;
}

.custom .mdi-vuejs {
	color: #41B883;
}

.custom .mdi-code-json {
	color: #a86200;
}

.custom .mdi-language-typescript {
	color: #007ACD;
}

.custom .mdi-language-html5 {
	color: #E75212;
}
</style>
