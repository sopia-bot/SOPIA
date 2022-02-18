<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<div>
		<v-app-bar fixed app>
			<v-spacer></v-spacer>
			<bundle-upload-button/>
		</v-app-bar>
		<v-main class="pa-4">
			<v-row class="ma-0">
				<v-col cols="4" v-for="(bundle) in bundleList" :key="bundle.name">
					<bundle-item :pkg="bundle" />
				</v-col>
			</v-row>
		</v-main>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import BundleUploadButton from './BundleUploadBtn.vue';
import BundleItem from './BundleItem/Index.vue';
import { BundlePackage } from '@/interface/bundle';

@Component({
	components: {
		BundleUploadButton,
		BundleItem,
	},
})
export default class BundleStore extends Mixins(GlobalMixins) {

	public bundleList: BundlePackage[] = [];

	public created() {
		this.refreshBundleList();
		this.$evt.$off('store:reload');
		this.$evt.$on('store:reload', this.refreshBundleList.bind(this));
	}

	public async refreshBundleList() {
		const res = await this.$api.req('GET', '/bundle/');
		this.bundleList = res.data;
	}

}
</script>
