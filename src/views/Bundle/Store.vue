<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="pa-6 grey lighten-4" style="min-height: 100vh; margin-left: 80px;">
		<v-row class="ma-0" align="center">
			<v-col cols="4">
				<h1>{{ $t('bundle.store.title') }}</h1>
			</v-col>
			<v-col offset="4" cols="4" align="right">
				<v-text-field
					v-model="searchText"
					solo
					single-line
					:placeholder="$t('bundle.store.search')"
					@keydown="searchKeyDown"
					hide-details></v-text-field>
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
		<v-row class="ma-0 my-4" align="center">
			<v-col cols="9">
				<h3>{{ $t('bundle.store.local-bundle') }}</h3>
			</v-col>
		</v-row>
		<bundle-item
			v-for="bundle in localBundleList"
			:key="bundle.name"
			:pkg="bundle">
		</bundle-item>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import BundleMixins from './bundle-mixin';
import BundleUploadButton from './BundleUploadBtn.vue';
import BundleItem from './BundleItem/Index.vue';
import { BundlePackage } from '@/interface/bundle';
import path from 'path';
const fs = window.require('fs');

@Component({
	components: {
		BundleUploadButton,
		BundleItem,
	},
})
export default class BundleStore extends Mixins(BundleMixins) {

	public bundleList: BundlePackage[] = [];
	public localBundleList: BundlePackage[] = [];
	public originalBundleList: BundlePackage[] = [];
	public originalLocalBundleList: BundlePackage[] = [];
	public searchText = '';
	public increment = 0;

	public async created() {
		await this.refreshBundleList();
		this.refreshLocalBundleList();
		this.$evt.$off('store:reload');
		this.$evt.$on('store:reload', this.refreshBundleList.bind(this));
	}

	public async refreshBundleList() {
		const res = await this.$api.req('GET', '/bundle/');
		this.originalBundleList = this.bundleList = res.data;
	}

	public async refreshLocalBundleList() {
		const bundleList = fs.readdirSync(this.bundleRootPath)
							.filter((bundle: string) => !this.bundleList.find(({name}) => name === bundle))
							.map((name: string) => path.join(this.bundleRootPath, name, 'package.json'))
							.filter((p: string) => fs.existsSync(p))
							.map((p: string) => JSON.parse(fs.readFileSync(p, 'utf8')));
		this.originalLocalBundleList = this.localBundleList = bundleList || [];
	}

	public searchCondition(bundle: BundlePackage) {
		return bundle['name']?.includes(this.searchText) ||
			bundle['name:ko']?.includes(this.searchText) ||
			bundle['description']?.includes(this.searchText) ||
			bundle['description:ko']?.includes(this.searchText);
	}

	public search() {
		this.increment -= 1;
		if ( this.increment <= 0 ) {
			this.bundleList = this.originalBundleList
				.filter(this.searchCondition.bind(this)) || [];
			this.localBundleList = this.originalLocalBundleList
				.filter(this.searchCondition.bind(this)) || [];
			this.increment = 0;
		}
	}

	public searchKeyDown() {
		if ( this.searchText.trim().length > 0 ) {
			this.increment += 1;
			setTimeout(() => this.search(), 500);
		}
	}

}
</script>
