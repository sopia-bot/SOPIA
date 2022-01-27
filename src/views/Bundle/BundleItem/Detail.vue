<template>
	<v-card>
		<v-card-title>
			{{ pkg.name }}
		</v-card-title>
		<v-card-text>

		</v-card-text>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn
				v-if="isPackageUsing"
				color="red darken-1"
				dark
				@click="uninstall">
				{{ $t('uninstall') }}
			</v-btn>
			<v-btn
				v-else
				color="indigo darken-1"
				dark
				@click="install">
				{{ $t('install') }}
			</v-btn>
		</v-card-actions>
	</v-card>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { BundlePackage } from '@/interface/bundle';
import path from 'path';
const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');

@Component
export default class BundleItemDetail extends Mixins(GlobalMixins) {

	@Prop(Object) public pkg!: BundlePackage;

	public bundlePath = path.join(this.$path('userData', 'bundles'), this.pkg.name);
	public isPackageUsing = false;

	public created() {
		this.updatePackageUsing();
	}

	private updatePackageUsing() {
		this.isPackageUsing = fs.existsSync(this.bundlePath);
	}

	public async install() {
		const res = await this.$api.req('GET', `/bundle/download/${this.pkg.name}/${this.pkg.version}/`);
		ipcRenderer.sendSync('zip:uncompress-buffer', res.data[0], this.bundlePath);
		this.updatePackageUsing();
	}

	public async uninstall() {
		this.$confirm({
			title: this.$t('bundle.store.remove-bundle'),
			content: this.$t('bundle.store.remove-bundle-desc', this.pkg.name),
			textOk: this.$t('yes'),
			textCancel: this.$t('no'),
		}).then((close) => {
			fs.rmdirSync(this.bundlePath, { recursive: true });
			this.updatePackageUsing();
			close();
		}).catch((close) => {
			close();
		});
	}

}
</script>