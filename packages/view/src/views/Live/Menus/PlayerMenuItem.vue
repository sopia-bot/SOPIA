<template>
	<div>
		<div @click="toggleContent">
			<slot></slot>
		</div>
		<div v-if="showContent" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background: rgba(0, 0, 0, 0.5); z-index: 20;">
			<slot name="menu"></slot>
		</div>
		<v-btn
			v-if="showContent"
			icon dark large
			style="position: absolute; top: 10px; right: 10px; z-index: 21;"
			@click="showContent = false">
			<v-icon>mdi-close</v-icon>
		</v-btn>
	</div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class PlayerMenuItem extends Mixins(GlobalMixins) {

	@Prop(Boolean) public disableContent!: boolean;
	public showContent: boolean = false;

	public toggleContent() {
		if ( this.disableContent ) {
			return;
		}
		this.showContent = !this.showContent;
	}

}
</script>
