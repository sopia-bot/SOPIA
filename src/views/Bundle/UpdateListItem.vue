<template>
	<v-row class="ma-0">
		<v-col cols="10" offset="1">
			<p class="text-overline mb-0 indigo--text text--darken-3" style="font-size: 1.1rem !important;">{{ pkg.name }}</p>
			<p class="text-caption">{{ message }}</p>
		</v-col>
	</v-row>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import BundleMixin from './bundle-mixin';
import { BundlePackage } from '@/interface/bundle';

const fs = window.require('fs');

@Component
export default class UpdateListItem extends Mixins(BundleMixin) {

	@Prop(Object) public pkg!: BundlePackage;
	public message: string = this.$t('bundle.update.ready', this.pkg.version);

	public mounted() {
		this.$off('install');
		this.$on('install:start', () => {
			this.message = this.$t('bundle.update.download');
			this.bundleInstall(this.pkg, false)
				.then(() => {
					this.message = this.$t('bundle.update.done');
					this.$emit('install:done');
				});
		});
	}

}
</script>