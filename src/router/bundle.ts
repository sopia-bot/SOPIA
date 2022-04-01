const path = window.require('path');
const fs = window.require('fs');
const vm = window.require('vm');
import { getAppPath } from '@/plugins/ipc-renderer';
import { RouteConfig } from './index';
import { BundlePackage } from '@/interface/bundle';
import Vuetify from '../plugins/vuetify';

export interface BundleInfo {
	dir: string;
	pkg: BundlePackage;
	name: string;
	page?: string;
}
const basePath = path.resolve(getAppPath('userData'), 'bundles');

export function bundleReadDir() {
	const dirs = fs.readdirSync(basePath);
	const lang = Vuetify.framework.lang.current;
	if ( Array.isArray(dirs) ) {
		return dirs.map((dir) => {
			const p = path.resolve(basePath, dir);
			const pkgPath = path.resolve(p, 'package.json');
			const info: BundleInfo = {
				name: dir,
				dir: p,
				pkg: {} as BundlePackage,
			};

			if ( fs.existsSync(pkgPath) ) {
				info.pkg = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf8' }));
			}
			return info;
		})
		.filter((info) => info.pkg && info.pkg.page)
		.map((info: any) => {
			let name = info.name;
			if ( info.pkg['name:' + lang] ) {
				name = info.pkg['name:' + lang];
			}
			return {
				name,
				path: '/bundle/' + path.basename(info.dir) + '/',
				icon: info.pkg.icon || 'mdi-tangram',
				translated: true,
			};
		}) as RouteConfig[];
	}
	return [] as RouteConfig[];
}

export function createBundleRouter() {
	return [
		{
			name: 'store',
			path: '/bundle/store/',
			icon: 'mdi-basket',
		},
		...bundleReadDir(),
		{
			path: '',
			redirect: '/bundle/store/',
		},
	];
}

export default {
	name: 'Bundle',
	path: '/bundle/:bundle/',
	component: () => import('@/views/Bundle/Index.vue'),
	icon: 'mdi-puzzle',
	isMenu: true,
	children: createBundleRouter(),
} as RouteConfig;
