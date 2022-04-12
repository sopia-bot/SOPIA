<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="pa-6 grey lighten-4" style="min-height: 100vh;">
		<v-row class="ma-0">
			<v-col cols="4">
				<h1>{{ $t('bundle.store.title') }}</h1>
			</v-col>
		</v-row>
		<v-row class="ma-0 my-4" align="center">
			<v-col cols="9">
				<h3>{{ $t('bundle.store.subtitle') }}</h3>
				<p class="ma-0">{{ $t('bundle.store.description') }}</p>
			</v-col>
			<v-col cols="3" align="right">
				<bundle-upload-button />
			</v-col>
		</v-row>
		<bundle-item
			v-for="bundle in bundleList"
			:key="bundle.name"
			:pkg="bundle">
		</bundle-item>
		<div style="height: 50px;"></div>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import BundleMixins from './bundle-mixin';
import BundleUploadButton from './BundleUploadBtn.vue';
import BundleItem from './BundleItem/Index.vue';
import { BundlePackage } from '@/interface/bundle';

@Component({
	components: {
		BundleUploadButton,
		BundleItem,
	},
})
export default class BundleStore extends Mixins(BundleMixins) {

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
