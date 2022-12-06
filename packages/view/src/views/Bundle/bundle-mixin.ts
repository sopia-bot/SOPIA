import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { BundlePackage } from '@/interface/bundle';
import { SweetAlertOptions } from 'sweetalert2';
import { npmInstall } from '@/plugins/ipc-renderer';

const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');
import path from 'path';

@Component
export default class BundleMixin extends Mixins(GlobalMixins) {
	public bundleRootPath = this.$path('userData', 'bundles');

	get description() {
		const pkg = (this as any).pkg as any || {};
		if ( pkg['description:' + this.language] ) {
			return pkg['description:' + this.language];
		}
		return pkg.description;
	}

	get name() {
		const pkg = (this as any).pkg as any || {};
		if ( pkg['name:' + this.language] ) {
			return pkg['name:' + this.language];
		}
		return pkg.name;
	}

	public getBundlePath(pkg: BundlePackage) {
		return path.join(this.bundleRootPath, pkg.name);
	}

	public async checkPackageProperty(pkg: BundlePackage, key: keyof BundlePackage) {
		if ( !pkg[key] ) {
			this.$logger.err('bundle', 'Did not have name property in package.json', pkg);
			await this.$swal({
				icon: 'error',
				title: this.$t('error'),
				html: this.$t('bundle.store.error.must-be', key),
			});
			return false;
		}
		return true;
	}

	public async bundleInstall(pkg: BundlePackage, showNoti: boolean = true) {
		const res = await this.$api.req('GET', `/bundle/download/${pkg.name}/${pkg.version}/`);
		if ( !res.data[0] ) {
			await this.$swal({
				icon: 'error',
				title: this.$t('error'),
				html: this.$t('bundle.download-fail'),
			});
			return;
		}

		const p = this.getBundlePath(pkg);
		ipcRenderer.sendSync('package:uncompress-buffer', res.data[0], p);

		if ( pkg.dependencies ) {
			await npmInstall(Object.entries(pkg.dependencies).map(([name, version]) => ({
				name,
				version,
			})), {
				rootDir: p,
			});
		}

		if ( showNoti ) {
			const option: SweetAlertOptions = {
				icon: 'success',
				toast: true,
				position: 'top-end',
				html: this.$t('bundle.store.install-scucess', pkg.name),
				timer: 3000,
				showCloseButton: false,
				showConfirmButton: false,
				showCancelButton: true,
				cancelButtonText: this.$t('close'),
			};

			if ( pkg.page ) {
				option.showConfirmButton = true;
				option.confirmButtonText = this.$t('bundle.store.move-bundle-page');
			}

			this.$swal(option).then((result) => {
				if ( pkg.page && result.isConfirmed ) {
					this.$emit('close');
					this.$assign(`/bundle/${path.basename(p)}/`);
				}
			});
		}
	}

	public bundleUninstall(pkg: BundlePackage, showNoti: boolean = true) {
		return new Promise((resolve, reject) => {
			this.$swal({
				icon: 'question',
				title: this.$t('bundle.store.remove-bundle'),
				html: this.$t('bundle.store.remove-bundle-desc', pkg.name),
				showCancelButton: true,
				confirmButtonText: this.$t('yes'),
				cancelButtonText: this.$t('no'),
			}).then((result) => {
				if ( result.isConfirmed ) {
					fs.rmdirSync(this.getBundlePath(pkg), { recursive: true });
					if ( showNoti ) {
						this.$swal({
							icon: 'success',
							toast: true,
							position: 'top-end',
							timer: 3000,
							showCloseButton: false,
							showConfirmButton: false,
							showCancelButton: true,
							cancelButtonText: this.$t('close'),
							html: this.$t('bundle.store.remove-bundle-success', pkg.name),
						});
					}
				}
				resolve(null);
			});
		});
	}

}
