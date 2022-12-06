<template>
	<v-row class="ma-0">
		<v-col cols="10" offset="1">
			<v-checkbox
				:label="pkg.name"
				class="ma-0"
				hide-details
				v-model="updateFlag">
			</v-checkbox>
			<p class="ma-0 mt-1 text-caption">{{ message }}</p>
			<v-list-group
				v-if="!!releaseNote"
				dense
				class="pa-0">
				<template v-slot:activator>
					<v-list-item-icon>
						<v-icon>mdi-arrow-right-bottom</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						{{ $t('bundle.store.show-release-note') }}
					</v-list-item-content>
				</template>
				<v-list-item class="pa-0">
					<v-list-item-content v-html="releaseNote" class="grey lighten-3 pa-4">
					</v-list-item-content>
				</v-list-item>
			</v-list-group>
			
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

	public updateFlag = false;

	public mounted() {
		this.$off('install');
		this.$on('install:start', async (force = false) => {
			console.log('start', this.pkg.name, force, this.updateFlag);
			if ( force === false && this.updateFlag === false ) {
				await this.$sleep(100);
				this.$emit('install:done');
				return;
			}
			this.message = this.$t('bundle.update.download');
			await this.bundleInstall(this.pkg, false);
			this.message = this.$t('bundle.update.done');
			this.$emit('install:done');
		});
	}

	get releaseNote() {
		return this.pkg['release-note']?.[this.pkg.version];
	}

}
</script>