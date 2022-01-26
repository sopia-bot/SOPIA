<template>
	<v-card>
		<h1>{{ pkg.name }}</h1>
		<p>{{ pkg.version }}</p>
		<p>{{ pkg.description }}</p>
	</v-card>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { BundlePackage } from '@/interface/bundle';

@Component
export default class BundleItem extends Mixins(GlobalMixins) {

	@Prop(Object) public pkg!: BundlePackage;

}
</script>
