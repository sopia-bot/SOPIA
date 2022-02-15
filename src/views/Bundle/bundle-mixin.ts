import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { BundlePackage } from '@/interface/bundle';

const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');
import path from 'path';

@Component
export default class BundleMixin extends Mixins(GlobalMixins) {
	public bundleRootPath = this.$path('userData', 'bundles');

	public getBundlePath(pkg: BundlePackage) {
		return path.join(this.bundleRootPath, pkg.name);
	}

	public async checkPackageProperty(pkg: BundlePackage, key: keyof BundlePackage) {
		if ( !pkg[key] ) {
			this.$logger.err('bundle', 'Did not have name property in package.json', pkg);
			const close = await this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('bundle.store.error.must-be', key),
			});
			close();
			return false;
		}
		return true;
	}

	public async bundleInstall(pkg: BundlePackage, showNoti: boolean = true) {
		const res = await this.$api.req('GET', `/bundle/download/${pkg.name}/${pkg.version}/`);
		if ( !res.data[0] ) {
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('bundle.download-fail'),
			}).then((close) => {
				close();
			}).catch((close) => {
				close();
			});
			return;
		}
		ipcRenderer.sendSync('zip:uncompress-buffer', res.data[0], this.getBundlePath(pkg));

		if ( showNoti ) {
			this.$noti({
				type: 'success',
				horizontal: 'right',
				vertical: 'bottom',
				content: this.$t('bundle.store.install-scucess', pkg.name),
				timeout: 3000,
			});
		}
	}

	public bundleUninstall(pkg: BundlePackage, showNoti: boolean = true) {
		return new Promise((resolve, reject) => {
			this.$confirm({
				title: this.$t('bundle.store.remove-bundle'),
				content: this.$t('bundle.store.remove-bundle-desc', pkg.name),
				textOk: this.$t('yes'),
				textCancel: this.$t('no'),
			}).then((close) => {
				fs.rmdirSync(this.getBundlePath(pkg), { recursive: true });
				if ( showNoti ) {
				this.$noti({
						type: 'success',
						horizontal: 'right',
						vertical: 'bottom',
						content: this.$t('bundle.store.remove-bundle-success', pkg.name),
						timeout: 3000,
					});
				}
				close();
				resolve(null);
			}).catch((close) => {
				close();
				reject();
			});
		});
	}

}
