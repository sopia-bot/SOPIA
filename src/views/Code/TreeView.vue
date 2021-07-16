<!--
 * TreeView.vue
 * Created on Fri Aug 28 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<div class="wrapper" style="width:100%;">
		<v-dialog
			v-model="namebox"
			width="260px"
			style="height: 70px;"
			content-class="custom namebox px-4 py-1"
			@click:outside="nbOutsideClick"
			@keydown="nbKeydown"
			ref="namebox">
			<v-text-field
				ref="name-input"
				v-model="newName"
				dark></v-text-field>
		</v-dialog>
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
						<div
							:ref="node.data.value"
							@contextmenu.stop="$emit('contextmenu', $event, node)">
							{{ node.text }}
						</div>
					</template>
					<!-- E:Folder -->

					<!-- S:File -->
					<template v-else>
						<div
							:ref="node.data.value"
							@contextmenu.stop="$emit('contextmenu', $event, node)">
							<i :class="node.data.icon"></i>
							{{ node.text }}
						</div>
					</template>
					<!-- E:File -->
				</span>
			</tree>
		</div>
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

	public namebox: boolean = false;
	public newName: string = '';
	public nbnew: boolean = false; // true: new file or directory
	public nbdir: string = '';
	public nbtype: 'FILE' | 'DIR' = 'FILE';

	get selectedNode(): any {
		const treeRef = this.$refs.tree as any;
		const tree = treeRef.tree;
		if ( this.selectPath ) {
			const node = this.searchNode(tree.model, this.selectPath);
			return node;
		}
	}

	public mounted() {
		this.treeRenderer = false;
		this.targetFolder = this.$route.params.folder;
		this.folderTree = this.buildFolderTree(this.$path('userData', this.targetFolder));

		this.$evt.$off('code:new');
		this.$evt.$on('code:new', (dir: string, type: 'FILE' | 'DIR') => {
			this.nbdir = dir;
			this.nbtype = type;
			this.nbnew = true;
			this.$logger.debug('code', `New content [${dir}]`);
			this.openNameBox(10, 10, '');
		});

		this.$evt.$off('code:rename');
		this.$evt.$on('code:rename', () => {
			const node = this.selectedNode;
			if ( node ) {
				const sel = this.$refs[node.data.value] as HTMLElement;
				const position = sel.getBoundingClientRect();

				const x = position.x + 50;
				const y = position.y - 80;

				this.openNameBox(x, y, sel.innerText);
			} else {
				this.$logger.err('code', 'No selected file.');
				this.$modal({
					type: 'error',
					title: 'Error',
					content: this.$t('code.msg.no-selected'),
				});
			}
		});

		this.$evt.$off('code:remove');
		this.$evt.$on('code:remove', () => {
			const node = this.selectedNode;
			if ( node ) {
				const stat = fs.statSync(node.data.value);
				if ( stat.isDirectory() ) {
					fs.rmdirSync(node.data.value, { recursive: true });
				} else {
					fs.unlinkSync(node.data.value);
				}
				this.$evt.$emit('code:tree-rerender', node.data.value, !node.hasChildren());
			} else {
				this.$logger.err('code', 'No selected file.');
				this.$modal({
					type: 'error',
					title: 'Error',
					content: this.$t('code.msg.no-selected'),
				});
			}
		});

		this.$evt.$off('code:select');
		this.$evt.$on('code:select', (p: string) => {
			const treeRef = this.$refs.tree as any;
			if ( !treeRef || !treeRef.tree || !treeRef.tree.model ) {
				this.$nextTick(() => {
					this.$evt.$emit('code:select', p);
				});
				return;
			}

			this.selectPath = p;
			const node = this.selectedNode;
			this.$logger.debug('code', `Select path [${p}] node`, node);
			if ( node ) {
				node.select(true);
			}
		});


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

	public openNameBox(x: number, y: number, str: string = '') {
		this.namebox = true;

		this.$nextTick(() => {
			const namebox = document.querySelector('.custom.namebox') as HTMLElement;
			namebox.style.left = x + 'px';
			namebox.style.top = y + 'px';

			this.$nextTick(() => {
				this.$nextTick(() => {
					const ni = this.$refs['name-input'] as any;
					ni.focus();
				});
				this.newName = str;
			});
		});
	}

	public nbKeydown(evt: KeyboardEvent) {
		switch ( evt.key ) {
			case 'Enter':
				this.applyNameBox();
				break;
			default:
				this.$logger.debug('code', 'Input namebox key.', evt);
				break;
		}
	}

	public nbOutsideClick() {
		this.$logger.debug('code', 'Click the outside of namebox');
		this.applyNameBox();
	}

	public applyNameBox() {
		if ( this.newName === '' ) {
			return;
		}

		if ( this.nbnew ) {
			const target = path.join(this.nbdir, this.newName);
			if ( fs.existsSync(target) ) {
				this.$logger.err('code', `Exists file or directory. [${target}]`);
				this.$modal({
					type: 'error',
					title: 'Error',
					content: this.$t('code.msg.exists'),
				});
				return;
			}

			if ( !fs.existsSync(this.nbdir) ) {
				this.$logger.err('code', `No such file or directory. [${this.nbdir}]`);
			}

			switch ( this.nbtype ) {
				case 'FILE':
					fs.writeFileSync(target, '');
					break;
				case 'DIR':
					fs.mkdirSync(target);
					break;
			}

			this.nbnew = false;
			this.$evt.$emit('code:tree-rerender');
		} else {
			const node = this.selectedNode;
			const oriP = node.data.value;
			const dirP = path.dirname(oriP);
			const newP = path.join(dirP, this.newName);

			this.namebox = false;

			fs.renameSync(oriP, newP);
			this.$logger.success(`Rename [${oriP}] -> [${newP}]`);
			this.$evt.$emit('code:tree-rerender', newP, !node.hasChildren());
		}
	}

	public checkFolder(): Promise<void> {
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
						treeRef.$off('node:selected');
						treeRef.$on('node:selected', (node: any) => {
							const file = node.data.value;
							this.selectPath = file;
							this.$emit('selected', node);
						});

						if ( this.selectPath ) {
							const node = this.selectedNode;
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
				if ( value === node.data.value ) {
					return node;
				} else if ( value.indexOf(node.data.value) === 0 ) {
					if ( !node.states.expanded ) {
						node.toggleExpand();
					}
					return this.searchNode(node.children, value);
				}
			}
		}
	}

	public readdir(PATH: string, DIR: string = '', ORI: any, sf?: any[]) {
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
					obj.data['idChange'] = false;

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
						obj['children'] = this.readdir(fullPath, '', oriObj && oriObj.children );

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
	}

	public buildFolderTree(src: string, selectedFile: string = '') {
		const ori = this.oriFolderTree;

		const sfs = selectedFile ? selectedFile.split('/') : [];
		return this.readdir(src, '', ori, sfs);
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

.custom.v-dialog {
	position: fixed !important;
	background: rgba(32, 38, 104, 0.85) !important;
	height: 73px;
	overflow: hidden;
}
</style>
