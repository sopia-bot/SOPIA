<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<div>
		<v-app-bar fixed>
			<v-spacer></v-spacer>
			<v-btn icon @click="uploadBundle">
				<v-icon>mdi-folder-upload</v-icon>
			</v-btn>
		</v-app-bar>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import path from 'path';
const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');

@Component
export default class BundleStore extends Mixins(GlobalMixins) {

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
		if ( !fs.existsSync(indexFile) ) {
			this.$logger.err('bundle', 'Could not find index.js from bundle', indexFile);
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('errors.file-not-found', 'index.js'),
			}).then((close) => {
				close();
			});
			return;
		}

		const packageFile = path.join(target, 'package.json');
		if ( !fs.existsSync(packageFile) ) {
			this.$logger.err('bundle', 'Could not find package.json from bundle', packageFile);
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('errors.file-not-found', 'package.json'),
			}).then((close) => {
				close();
			});
			return;
		}

		// Caching package.json file content when use window.require fucntion.
		// We should not have cache that.
		const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
		this.$logger.debug('bundle', 'Package content', packageFile, pkg);

		if ( !pkg.name ) {
			this.$logger.err('bundle', 'Did not have name property in package.json', pkg);
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('bundle.store.error.must-be', 'name'),
			}).then((close) => {
				close();
			});
			return;
		}

		if ( !pkg.version ) {
			this.$logger.err('bundle', 'Did not have version property in package.json', pkg);
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('bundle.store.error.must-be', 'version'),
			}).then((close) => {
				close();
			});
			return;
		}

		const zipFile = target + '.zip';
		if ( fs.existsSync(zipFile) ) {
			this.$logger.debug('bundle', 'Exists zip file. remove it', zipFile);
			fs.unlinkSync(zipFile);
		}

		ipcRenderer.sendSync('zip:create', target, zipFile);

		if ( !fs.existsSync(zipFile) ) {
			this.$logger.err('bundle', 'Create zip file error.', zipFile);
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('bundle.store.error.create-error'),
			}).then((close) => {
				close();
			});
			return;
		}

		this.$logger.success('bundle', 'Create zip file success.', zipFile);

		// TODO: upload bundle
		const res = await this.$api.req('PUT', '/bundle/', {
			name: pkg.name,
			version: pkg.version,
			data: fs.readFileSync(zipFile, 'base64'),
		});

		if ( res.error ) {
			this.$logger.err('bundle', 'Package upload error', res);
			this.$modal({
				type: 'error',
				title: this.$t('error'),
				content: this.$t('bundle.store.error.' + res.msg),
			}).then((close) => {
				close();
			});
			return;
		}

		fs.unlinkSync(zipFile);
		this.$logger.success('bundle', 'Bundle upload done.');

		this.$modal({
			type: 'error',
			title: this.$t('error'),
			content: this.$t('bundle.store.upload-success'),
		}).then((close) => {
			close();
		});
	}
}
</script>
