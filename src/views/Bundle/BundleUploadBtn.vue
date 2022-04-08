<template>
	<div>
		<v-btn icon @click="uploadBundle">
			<v-icon>mdi-folder-upload</v-icon>
		</v-btn>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import BundleMixins from './bundle-mixin';
import path from 'path';
const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');

@Component
export default class BundleUploadButton extends Mixins(BundleMixins) {

	public async checkFile(src: string) {
		if ( !fs.existsSync(src) ) {
			this.$logger.err('bundle', 'Could not find index.js from bundle', src);
			await this.$swal({
				icon: 'error',
				title: this.$t('error'),
				html: this.$t('errors.file-not-found', path.basename(src)),
			});
			return false;
		}
		return true;
	}

	public async uploadBundle() {
		const result = await ipcRenderer.invoke('open-dialog', {
			properties: ['openDirectory'],
			title: 'Upload Bundle',
			defaultPath: this.$path('userData', 'bundles'),
		});
		if ( result.canceled ) {
			this.$logger.err('bundle', 'Canceled folder select for bundle upload.');
			return;
		}

		const target = result.filePaths[0];

		const indexFile = path.join(target, 'index.js');
		if ( !await this.checkFile(indexFile) ) {
			return;
		}

		const packageFile = path.join(target, 'package.json');
		if ( !await this.checkFile(packageFile) ) {
			return;
		}

		const readmeFile = path.join(target, 'README.md');
		if ( !await this.checkFile(readmeFile) ) {
			return;
		}

		// Caching package.json file content when use window.require fucntion.
		// We should not have cache that.
		const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
		this.$logger.debug('bundle', 'Package content', packageFile, pkg);

		if ( !await this.checkPackageProperty(pkg, 'name') ) {
			return;
		}

		if ( !await this.checkPackageProperty(pkg, 'version') ) {
			return;
		}

		if ( !pkg.description ) {
			pkg.description = 'No description';
		}

		const zipFile = target + '.zip';
		if ( fs.existsSync(zipFile) ) {
			this.$logger.debug('bundle', 'Exists zip file. remove it', zipFile);
			fs.unlinkSync(zipFile);
		}

		ipcRenderer.sendSync('package:create', target, zipFile);

		if ( !fs.existsSync(zipFile) ) {
			this.$logger.err('bundle', 'Create zip file error.', zipFile);
			await this.$swal({
				icon: 'error',
				title: this.$t('error'),
				html: this.$t('bundle.store.error.create-error'),
			});
			return;
		}

		this.$logger.success('bundle', 'Create zip file success.', zipFile);

		const res = await this.$api.req('PUT', '/bundle/', {
			name: pkg.name,
			version: pkg.version,
			data: fs.readFileSync(zipFile, 'base64'),
		});
		fs.unlinkSync(zipFile);

		if ( res.error ) {
			this.$logger.err('bundle', 'Package upload error', res);
			await this.$swal({
				icon: 'error',
				title: this.$t('error'),
				html: this.$t('bundle.store.error.' + res.msg),
			});
			return;
		}

		this.$logger.success('bundle', 'Bundle upload done.');

		this.$swal({
			icon: 'success',
			title: this.$t('success'),
			html: this.$t('bundle.store.upload-success'),
		});
	}
}
</script>
